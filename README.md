
#  Listigo Demo

##  Overview

**Listigo Demo** is a full-stack application for managing listings with features like creating, updating, deleting, filtering, and photo management.

-  **Backend**: Java + Spring Boot
-  **Frontend**: React
-  **Platform**: Web application


##  Technologies

**Backend**
- Java 21
- Spring Boot, Spring Security, JPA/Hibernate
- JWT for authentication
- Liquibase for DB migrations
- Maven for dependency management

**Frontend**
- React with TypeScript/JavaScript
- `package.json` for dependency management (using `react-scripts` for build and development)
- Tailwind CSS for styling

**Database**
- PostgreSQL

---

##  Prerequisites

- Java 21
- Node.js (e.g., LTS version like 18.x or 20.x)
- npm (comes with Node.js) or yarn
- PostgreSQL
- Maven
- Git
- IDE: IntelliJ IDEA (backend), VS Code or any preferred editor (frontend)
- Modern Web Browser (Chrome, Firefox, Edge, Safari)

---

##  Setup Instructions

###  Backend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SelahattinSert/listigo-demo.git
   cd listigo-demo/listigo-demo
   ```

2. **Configure Database**  
   Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/ListigoDB
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Create Database**  
   Make sure `ListigoDB` exists in your PostgreSQL server.

4. **Install Dependencies**
   ```bash
   mvn clean install
   ```

5. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```
   The backend will start at: [http://localhost:8080](http://localhost:8080)

6. **Initialize Database**  
   Liquibase will automatically apply migrations from:  
   `src/main/resources/db/changelog/`

---

###  Frontend Setup

(Assuming the React project is in a directory like `listigo-frontend` at the same level as the backend's parent directory)

1. **Navigate to Frontend Directory**
   ```bash
   cd ../listigo-frontend
   ```

2. **Install Dependencies**
   Using npm:
   ```bash
   npm install
   ```
   Or using yarn:
   ```bash
   yarn install
   ```

3. **API Endpoint Configuration**  
   The frontend is configured to proxy API requests from `/api/v1` to `http://localhost:8080/api/v1` (as defined in `package.json`'s `proxy` field). Ensure your backend is running at `http://localhost:8080`. The base URL `/api/v1` is defined in `src/constants.ts`.

4. **Run the Application**
   Using npm:
   ```bash
   npm start
   ```
   Or using yarn:
   ```bash
   yarn start
   ```
   The frontend development server will typically start at [http://localhost:3000](http://localhost:3000).
