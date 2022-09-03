CREATE TABLE IF NOT EXISTS session(
    sid          TEXT PRIMARY KEY,
    t TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS event(
    session_id  TEXT NOT NULL,
    route       TEXT,
    type        TEXT,
    FOREIGN KEY(session_id) REFERENCES session(sid)
);