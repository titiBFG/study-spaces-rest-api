from sqlalchemy.orm import Session, joinedload

from app.models.post import Post

# ---------------------------- Publicaciones ----------------------------

def get_post_by_id(session: Session, post_id: int) -> Post | None:
    """Devuelve la publicación con ese id, o None si no existe."""
    return session.query(Post).filter(Post.id == post_id).first()


def get_active_posts_by_space_id(session: Session, space_id: int) -> list[Post]:
    """Devuelve las publicaciones visibles de un espacio, de la más nueva a la más vieja."""
    return (
        session.query(Post)
        .options(joinedload(Post.author))
        .filter(Post.space_id == space_id, Post.is_active.is_(True))
        .order_by(Post.created_at.desc(), Post.id.desc())
        .all()
    )


def get_posts_by_author_id(session: Session, author_id: int) -> list[Post]:
    """Devuelve todas las publicaciones de un negocio, incluidas las ocultas."""
    return (
        session.query(Post)
        .options(joinedload(Post.author))
        .filter(Post.author_id == author_id)
        .order_by(Post.created_at.desc(), Post.id.desc())
        .all()
    )


def create_post(
    session: Session,
    author_id: int,
    space_id: int,
    title: str,
    content: str,
    images: list[str],
) -> Post:
    """Crea y guarda una publicación."""
    post = Post(
        author_id=author_id,
        space_id=space_id,
        title=title,
        content=content,
        images=images,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


def update_post(session: Session, post: Post, changes: dict) -> Post:
    """Aplica los cambios indicados (campo -> valor) a una publicación ya cargada."""
    for field, value in changes.items():
        setattr(post, field, value)
    session.commit()
    session.refresh(post)
    return post


def delete_post(session: Session, post: Post) -> None:
    """Elimina una publicación ya cargada."""
    session.delete(post)
    session.commit()
