-- Create Venue table
CREATE TABLE IF NOT EXISTS Venue (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    ownerEmail TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Event table
CREATE TABLE IF NOT EXISTS Event (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    venueId TEXT NOT NULL,
    recurrence TEXT,
    groupId TEXT,
    bookingUrl TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venueId) REFERENCES Venue(id)
);

-- Create Ad table
CREATE TABLE IF NOT EXISTS Ad (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    targetUrl TEXT,
    imageUrl TEXT,
    location TEXT NOT NULL,
    expiryDate TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
