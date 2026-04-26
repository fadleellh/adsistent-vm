CREATE TABLE IF NOT EXISTS users (
    telegram_chat_id BIGINT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id VARCHAR(50) PRIMARY KEY,
    telegram_chat_id BIGINT REFERENCES users(telegram_chat_id),
    campaign_name VARCHAR(255) NOT NULL,
    daily_budget_idr DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
