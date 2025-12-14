# Travel Backend System

This is a Django backend for the Luxury Travel Agency website.

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install django pillow djangorestframework
    ```

2.  **Apply Migrations**:
    ```bash
    python manage.py migrate
    ```

3.  **Create User Roles**:
    ```bash
    python manage.py create_roles
    ```

4.  **Create Superuser**:
    ```bash
    python manage.py createsuperuser
    ```

5.  **Run Server**:
    ```bash
    python manage.py runserver
    ```

## Apps

*   **Core**: Shared models and utilities.
*   **Marketing**: Manages `SiteLogo` and `Advertisement`.
*   **Tours**: Manages `TourService` and `TourGalleryImage`.

## Features

*   **Soft Deletion**: Tours are soft-deleted to preserve history.
*   **Active Logo Logic**: Only one logo can be active at a time.
*   **Ad Scheduling**: Advertisements are filtered by start/end date.
*   **Role-Based Access**: `ContentManager` (Tours) and `MarketingManager` (Ads/Logos) groups.
