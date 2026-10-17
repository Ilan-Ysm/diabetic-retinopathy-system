from app.modules.users.models import User

PASSWORD = "secret-pass-123"
NEW_USER = {
    "email": "Ivanova@Clinic.kz",
    "full_name": "Айгерим Иванова",
    "password": "strong-pass-1",
}
SCAN = {"title": "Fundus-demo-001", "dataset": "SYNTHETIC DEMO METADATA", "ground_truth_grade": 1}


def test_register_and_login(anon_client):
    created = anon_client.post("/auth/register", json=NEW_USER)
    assert created.status_code == 201
    user = created.json()
    assert user["email"] == "ivanova@clinic.kz"
    assert user["role"] == "doctor"
    assert "password" not in user and "password_hash" not in user

    token = anon_client.post(
        "/auth/login", data={"username": "ivanova@clinic.kz", "password": "strong-pass-1"}
    )
    assert token.status_code == 200
    headers = {"Authorization": f"Bearer {token.json()['access_token']}"}
    assert anon_client.get("/auth/me", headers=headers).json()["full_name"] == "Айгерим Иванова"


def test_register_rejects_duplicate_and_bad_data(anon_client):
    assert anon_client.post("/auth/register", json=NEW_USER).status_code == 201
    assert anon_client.post("/auth/register", json=NEW_USER).status_code == 409
    assert (
        anon_client.post("/auth/register", json={**NEW_USER, "password": "short"}).status_code
        == 422
    )
    assert (
        anon_client.post("/auth/register", json={**NEW_USER, "email": "no-at"}).status_code == 422
    )


def test_register_cannot_choose_role(anon_client):
    response = anon_client.post("/auth/register", json={**NEW_USER, "role": "admin"})
    assert response.status_code == 201
    assert response.json()["role"] == "doctor"


def test_login_wrong_password(make_client, anon_client):
    make_client("doctor@example.com")
    response = anon_client.post(
        "/auth/login", data={"username": "doctor@example.com", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_scans_require_login(anon_client):
    assert anon_client.get("/scans").status_code == 401
    assert anon_client.post("/scans", json=SCAN).status_code == 401
    assert anon_client.get("/scans", headers={"Authorization": "Bearer broken"}).status_code == 401


def test_scan_records_its_author(client):
    scan = client.post("/scans", json=SCAN).json()
    me = client.get("/auth/me").json()
    assert scan["owner_id"] == me["id"]
    assert scan["owner_name"] == "Test User"


def test_doctor_cannot_change_others_scan(client, make_client):
    scan_id = client.post("/scans", json=SCAN).json()["id"]
    other = make_client("other@example.com")

    assert other.get(f"/scans/{scan_id}").status_code == 200
    assert other.patch(f"/scans/{scan_id}", json={"title": "Changed"}).status_code == 403
    assert other.delete(f"/scans/{scan_id}").status_code == 403


def test_admin_can_change_any_scan(client, admin_client):
    scan_id = client.post("/scans", json=SCAN).json()["id"]
    response = admin_client.patch(f"/scans/{scan_id}", json={"ground_truth_grade": 2})
    assert response.status_code == 200
    assert admin_client.delete(f"/scans/{scan_id}").status_code == 204


def test_users_list_is_admin_only(client, admin_client):
    assert client.get("/users").status_code == 403
    emails = {u["email"] for u in admin_client.get("/users").json()}
    assert emails == {"doctor@example.com", "admin@example.com"}


def test_admin_changes_role_but_keeps_last_admin(client, admin_client):
    doctor_id = client.get("/auth/me").json()["id"]
    admin_id = admin_client.get("/auth/me").json()["id"]

    assert client.patch(f"/users/{doctor_id}/role", json={"role": "admin"}).status_code == 403
    assert admin_client.patch(f"/users/{admin_id}/role", json={"role": "doctor"}).status_code == 409

    promoted = admin_client.patch(f"/users/{doctor_id}/role", json={"role": "admin"})
    assert promoted.status_code == 200 and promoted.json()["role"] == "admin"


def test_password_is_hashed(make_client, db_session):
    make_client("doctor@example.com")
    user = db_session.query(User).one()
    assert user.password_hash != PASSWORD
    assert user.password_hash.startswith("$argon2")
