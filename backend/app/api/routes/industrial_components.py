"""
Industrial Components API Routes

Endpoints for managing component metadata and instances in projects.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.industrial_component import (
    ComponentMetadata, ComponentInstance, INDUSTRIAL_COMPONENTS_REGISTRY
)
from app.models.project import Project
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/components", tags=["components"])


# ──────────────────────────────────────────────────────────────────────────────
# Request/Response Models
# ──────────────────────────────────────────────────────────────────────────────

class ComponentPropertyInput(BaseModel):
    """Override for a component property."""
    name: str
    value: any


class ComponentPinAssignment(BaseModel):
    """Pin assignment mapping."""
    pin_name: str
    arduino_pin: Optional[int] = Field(None, ge=-1)  # -1 or None = not connected


class CreateComponentInstanceRequest(BaseModel):
    """Request to add a component to a project."""
    metadata_id: str
    position_x: float = 0.0
    position_y: float = 0.0
    rotation: int = Field(0, ge=0, le=360)
    label: Optional[str] = None
    properties: dict = Field(default_factory=dict)
    pin_assignments: dict = Field(default_factory=dict)


class UpdateComponentInstanceRequest(BaseModel):
    """Request to update a component instance."""
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    rotation: Optional[int] = None
    label: Optional[str] = None
    properties: Optional[dict] = None
    pin_assignments: Optional[dict] = None


class ComponentMetadataResponse(BaseModel):
    """Response model for component metadata."""
    id: str
    name: str
    description: Optional[str]
    category: str
    tags: List[str]
    simulation_type: str
    default_properties: dict
    pin_count: int
    pin_descriptions: dict
    default_pin_connections: dict
    supported_boards: List[str]
    thumbnail_svg: Optional[str]


class ComponentInstanceResponse(BaseModel):
    """Response model for component instance."""
    id: str
    project_id: str
    metadata_id: str
    position_x: float
    position_y: float
    rotation: int
    label: Optional[str]
    properties: dict
    pin_assignments: dict
    created_at: str


# ──────────────────────────────────────────────────────────────────────────────
# Metadata Endpoints (Read-only, for listing available components)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/metadata/", response_model=List[ComponentMetadataResponse])
async def list_component_metadata(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List all available component metadata.
    
    Query Parameters:
        category (str, optional): Filter by category (e.g., "industrial-sensor")
    """
    query = select(ComponentMetadata)
    
    if category:
        query = query.where(ComponentMetadata.category == category)
    
    result = await db.execute(query)
    components = result.scalars().all()
    
    return [ComponentMetadataResponse(**c.to_dict()) for c in components]


@router.get("/metadata/{component_id}", response_model=ComponentMetadataResponse)
async def get_component_metadata(
    component_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get metadata for a specific component type."""
    query = select(ComponentMetadata).where(ComponentMetadata.id == component_id)
    result = await db.execute(query)
    component = result.scalar_one_or_none()
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component metadata '{component_id}' not found"
        )
    
    return ComponentMetadataResponse(**component.to_dict())


@router.post("/metadata/seed", response_model=dict)
async def seed_component_metadata(db: AsyncSession = Depends(get_db)):
    """
    Seed the database with pre-defined industrial component metadata.
    
    WARNING: Should only be called once during initialization!
    """
    for comp_dict in INDUSTRIAL_COMPONENTS_REGISTRY:
        existing = await db.execute(
            select(ComponentMetadata).where(
                ComponentMetadata.id == comp_dict["id"]
            )
        )
        if existing.scalar_one_or_none():
            continue  # Already exists
        
        component = ComponentMetadata(
            id=comp_dict["id"],
            name=comp_dict["name"],
            description=comp_dict.get("description"),
            category=comp_dict.get("category", "other"),
            tags=comp_dict.get("tags", []),
            simulation_type=comp_dict.get("simulation_type"),
            default_properties=comp_dict.get("default_properties", {}),
            property_schema=comp_dict.get("property_schema", {}),
            pin_count=comp_dict.get("pin_count", 0),
            pin_descriptions=comp_dict.get("pin_descriptions", {}),
            default_pin_connections=comp_dict.get("default_pin_connections", {}),
            supported_boards=comp_dict.get("supported_boards", []),
            thumbnail_svg=comp_dict.get("thumbnail_svg"),
        )
        db.add(component)
    
    await db.commit()
    
    return {
        "message": "Component metadata seeded successfully",
        "count": len(INDUSTRIAL_COMPONENTS_REGISTRY)
    }


# ──────────────────────────────────────────────────────────────────────────────
# Component Instance Endpoints (CRUD for specific project components)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/projects/{project_id}/components", response_model=List[ComponentInstanceResponse])
async def list_project_components(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all components in a project.
    
    Requires project ownership by current user.
    """
    # Verify project ownership
    project = await db.execute(
        select(Project).where(
            (Project.id == project_id) &
            (Project.user_id == current_user.id)
        )
    )
    if not project.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    
    # Get all components
    query = select(ComponentInstance).where(
        ComponentInstance.project_id == project_id
    )
    result = await db.execute(query)
    components = result.scalars().all()
    
    return [
        ComponentInstanceResponse(
            id=c.id,
            project_id=c.project_id,
            metadata_id=c.metadata_id,
            position_x=c.position_x,
            position_y=c.position_y,
            rotation=c.rotation,
            label=c.label,
            properties=c.properties,
            pin_assignments=c.pin_assignments,
            created_at=c.created_at.isoformat()
        )
        for c in components
    ]


@router.post("/projects/{project_id}/components", response_model=ComponentInstanceResponse)
async def create_component_instance(
    project_id: str,
    req: CreateComponentInstanceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a component instance to a project.
    
    The component is placed on the canvas at (position_x, position_y).
    """
    # Verify project ownership
    project = await db.execute(
        select(Project).where(
            (Project.id == project_id) &
            (Project.user_id == current_user.id)
        )
    )
    if not project.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    
    # Verify metadata exists
    metadata = await db.execute(
        select(ComponentMetadata).where(
            ComponentMetadata.id == req.metadata_id
        )
    )
    if not metadata.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component metadata '{req.metadata_id}' not found"
        )
    
    # Create instance
    instance = ComponentInstance(
        id=str(uuid.uuid4()),
        project_id=project_id,
        metadata_id=req.metadata_id,
        position_x=req.position_x,
        position_y=req.position_y,
        rotation=req.rotation,
        label=req.label,
        properties=req.properties,
        pin_assignments=req.pin_assignments,
    )
    
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    
    return ComponentInstanceResponse(
        id=instance.id,
        project_id=instance.project_id,
        metadata_id=instance.metadata_id,
        position_x=instance.position_x,
        position_y=instance.position_y,
        rotation=instance.rotation,
        label=instance.label,
        properties=instance.properties,
        pin_assignments=instance.pin_assignments,
        created_at=instance.created_at.isoformat()
    )


@router.get("/projects/{project_id}/components/{component_id}", response_model=ComponentInstanceResponse)
async def get_component_instance(
    project_id: str,
    component_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific component instance."""
    # Verify ownership
    project = await db.execute(
        select(Project).where(
            (Project.id == project_id) &
            (Project.user_id == current_user.id)
        )
    )
    if not project.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Get component
    component = await db.execute(
        select(ComponentInstance).where(
            (ComponentInstance.id == component_id) &
            (ComponentInstance.project_id == project_id)
        )
    )
    instance = component.scalar_one_or_none()
    
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return ComponentInstanceResponse(
        id=instance.id,
        project_id=instance.project_id,
        metadata_id=instance.metadata_id,
        position_x=instance.position_x,
        position_y=instance.position_y,
        rotation=instance.rotation,
        label=instance.label,
        properties=instance.properties,
        pin_assignments=instance.pin_assignments,
        created_at=instance.created_at.isoformat()
    )


@router.patch("/projects/{project_id}/components/{component_id}", response_model=ComponentInstanceResponse)
async def update_component_instance(
    project_id: str,
    component_id: str,
    req: UpdateComponentInstanceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a component instance (position, properties, pins, etc.)."""
    # Verify ownership
    project = await db.execute(
        select(Project).where(
            (Project.id == project_id) &
            (Project.user_id == current_user.id)
        )
    )
    if not project.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Get component
    component = await db.execute(
        select(ComponentInstance).where(
            (ComponentInstance.id == component_id) &
            (ComponentInstance.project_id == project_id)
        )
    )
    instance = component.scalar_one_or_none()
    
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Update fields
    if req.position_x is not None:
        instance.position_x = req.position_x
    if req.position_y is not None:
        instance.position_y = req.position_y
    if req.rotation is not None:
        instance.rotation = req.rotation
    if req.label is not None:
        instance.label = req.label
    if req.properties is not None:
        instance.properties = req.properties
    if req.pin_assignments is not None:
        instance.pin_assignments = req.pin_assignments
    
    await db.commit()
    await db.refresh(instance)
    
    return ComponentInstanceResponse(
        id=instance.id,
        project_id=instance.project_id,
        metadata_id=instance.metadata_id,
        position_x=instance.position_x,
        position_y=instance.position_y,
        rotation=instance.rotation,
        label=instance.label,
        properties=instance.properties,
        pin_assignments=instance.pin_assignments,
        created_at=instance.created_at.isoformat()
    )


@router.delete("/projects/{project_id}/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_component_instance(
    project_id: str,
    component_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a component instance from a project."""
    # Verify ownership
    project = await db.execute(
        select(Project).where(
            (Project.id == project_id) &
            (Project.user_id == current_user.id)
        )
    )
    if not project.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Get and delete component
    component = await db.execute(
        select(ComponentInstance).where(
            (ComponentInstance.id == component_id) &
            (ComponentInstance.project_id == project_id)
        )
    )
    instance = component.scalar_one_or_none()
    
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    await db.delete(instance)
    await db.commit()
