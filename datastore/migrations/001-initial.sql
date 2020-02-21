-- Up

create table token (
  TeamId       text unique,
  TeamName     text,
  Created      text,
  TokenType    text,
  AccessToken  text,
  RefreshToken text,
  Scope        text,
  Expiry       text
);

-- Down

drop table token;
