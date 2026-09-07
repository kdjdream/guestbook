# Node.js + MySQL/MariaDB 방명록

## 1. 로컬 실행

```bash
npm install
```

`.env.example`을 복사해서 `.env`를 만들고 MySQL 접속정보를 입력합니다.

```bash
npm start
```

브라우저:

http://localhost:3000

## 2. MySQL 데이터베이스 준비

`sql/init.sql`을 MySQL에서 실행하거나 직접 다음 데이터베이스를 만듭니다.

```sql
CREATE DATABASE guestbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

앱은 시작할 때 `guestbook` 테이블이 없으면 자동으로 생성합니다.

## 3. Cloudtype 배포 개념

Cloudtype에서는 Node.js 웹 서비스와 MariaDB 같은 데이터베이스 서비스를 같은 배포환경에 둘 수 있습니다.

Node.js 서비스 환경변수:

- PORT=3000
- DB_HOST=<MariaDB 서비스 이름>
- DB_PORT=3306
- DB_USER=root
- DB_PASSWORD=<Cloudtype DB Root Password>
- DB_NAME=guestbook

같은 배포환경의 서비스끼리는 서비스 이름과 포트로 통신할 수 있으므로,
예를 들어 데이터베이스 서비스 이름이 `mariadb`라면:

DB_HOST=mariadb

로 설정할 수 있습니다.

Node.js 배포 설정:

- Preset: Node.js
- Port: 3000
- Install Command: npm install
- Build Command: 비워두거나 npm install
- Start Command: npm start
- Health Check: /health

GitHub 저장소에 push한 후 Cloudtype에서 해당 저장소를 선택하여 배포합니다.
