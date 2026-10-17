import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_session
from app.main import app
from app.modules.users import service as users
from app.modules.users.models import ROLE_ADMIN, ROLE_DOCTOR
from app.modules.users.schemas import UserCreate

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, expire_on_commit=False)
PASSWORD = "secret-pass-123"


@pytest.fixture(autouse=True)
def database():
    Base.metadata.create_all(engine)

    def override_session():
        with TestingSession() as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


@pytest.fixture
def make_client():
    """Create a TestClient logged in as a new user with the given role."""

    def _make(email: str | None = None, role: str = ROLE_DOCTOR) -> TestClient:
        client = TestClient(app)
        if email is None:
            return client
        with TestingSession() as session:
            users.create_user(
                session, UserCreate(email=email, full_name="Test User", password=PASSWORD), role
            )
        token = client.post("/auth/login", data={"username": email, "password": PASSWORD})
        client.headers["Authorization"] = f"Bearer {token.json()['access_token']}"
        return client

    return _make


@pytest.fixture
def db_session():
    with TestingSession() as session:
        yield session


@pytest.fixture
def client(make_client):
    return make_client("doctor@example.com")


@pytest.fixture
def anon_client(make_client):
    return make_client()


@pytest.fixture
def admin_client(make_client):
    return make_client("admin@example.com", ROLE_ADMIN)
