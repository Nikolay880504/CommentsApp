-- Schema for CommentsApp SQLite database

DROP TABLE IF EXISTS Comments;

CREATE TABLE Comments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    CreatedAt TEXT NOT NULL,
    Email TEXT NOT NULL,
    FilePath TEXT,
    HomePage TEXT,
    ParentCommentId INTEGER,
    Text TEXT NOT NULL,
    UserName TEXT NOT NULL
);
