-- This file is used for seeding the devServer MySQL database

create table teams (
  id int not null auto_increment primary key,
  name varchar(100),
  description text,
  credits integer(11) comment "Remaining usage credits",
  support_token varchar(60),
  created_at datetime,
  activated_at date
);

create table users (
  id int not null auto_increment primary key,
  team_id int not null,
  email varchar(100),
  password varchar(60),
  constraint fk_team_id
    foreign key (team_id)
    references teams (id)
);

-- One table without a primary key
create table page_visits (
  request_path varchar(100),
  user_agent varchar(200),
  created_at datetime
);

insert into teams
  (id, name, description, credits, created_at, activated_at)
values
  (1, "Acme Corp.", null, 28941, "2020-05-15 06:17:31", "2020-07-11"),
  (2, "Random Enterprises", "Facilitate ubiquitous communities", 47804, "2019-10-11 16:51:34", "2019-11-05"),
  (3, "Fool's Errands", null, 88615, "2020-09-25 07:09:41", "2020-07-11"),
  (4, "Misguided Productions", "Implement world-class interfaces", 77079, "2020-08-18 20:14:50", "2020-09-05"),
  (5, "Complex Solutions", null, 34777, "2020-05-06 05:44:48", "2020-07-11");

insert into users
  (id, team_id, email, password)
values
  (1, 1, "Keaton_Grant@example.com", "boUL102N9CDT4i4"),
  (2, 1, "John.Wiza85@example.com", "NrKzSjHBbmwo6oN"),
  (3, 1, "Amina.Hane@example.com", "m_LBoh2CVwxpp1B"),
  (4, 1, "Santino82@example.com", "ZYeI0tuqfqFpaId"),
  (5, 1, "Lesley70@example.com", "y4yt3aKnt0XkuZV"),
  (6, 1, "Wyman_Brown@example.com", "obJUmuNH9Gf8f9O"),
  (7, 1, "Richard.Miller30@example.com", "o9_6Ba9OUdyD3K8"),
  (8, 2, "Haleigh.Kulas@example.com", "d_tXXhpvsXCHnnO"),
  (9, 2, "Roman31@example.com", "KuWQeZk4y6CwYtJ"),
  (10, 2, "Suzanne34@example.com", "Zf3oH6yxI9FYhep"),
  (11, 2, "Brielle.Jacobson9@example.com", "giyn36K0aOwnIrz"),
  (12, 2, "Joanny68@example.com", "ZSO_zIkpvvJLJzs"),
  (13, 2, "Alexandrine70@example.com", "TEQPSUNwf8rsV_w"),
  (14, 2, "Jacey_Schmitt@example.com", "LPMYF4KcJs0qPHZ"),
  (15, 4, "Maryam.Rolfson@example.com", "kHovf1ApTb4KNz9"),
  (16, 4, "Brant_Parisian@example.com", "8TOUgAmOhe_SADN"),
  (17, 4, "Amina.Walsh57@example.com", "pMUpsCi_0tzOtHN"),
  (18, 5, "Toney.Williamson13@example.com", "OaD7UGGzLuXmMkC"),
  (19, 5, "Abby_Heathcote69@example.com", "MPmZNwOObSa2mya"),
  (20, 5, "Mya34@example.com", "n9GPzE8EhTHHyKX"),
  (21, 5, "Zula.Schoen74@example.com", "HOgCvgXYT5AgxZZ"),
  (22, 5, "Prince74@example.com", "osw6iIoCImIMjHC"),
  (23, 5, "Elvera.Lakin@example.com", "SQDuLxSjOsaRNdr"),
  (24, 5, "Tyrel77@example.com", "Jidpc6roE7MsfTc"),
  (25, 5, "Bette.Mills@example.com", "cPvnyXY55WGUCq_");

insert into page_visits
  (request_path, user_agent, created_at)
values
  ("/index.html", "Mozilla/5.0 (Windows; U; Windows NT 5.1) AppleWebKit/538.2.2 (KHTML, like Gecko) Chrome/23.0.839.0 Safari/538.2.2", "2019-10-30 08:31:59"),
  ("/favicon.ico", "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 5.2; Trident/3.1)", "2020-01-08 15:37:10"),
  ("/pages/about", "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/533.2.1 (KHTML, like Gecko) Chrome/17.0.858.0 Safari/533.2.1", "2020-02-29 02:35:35"),
  ("/privacy-policy", "Mozilla/5.0 (Windows; U; Windows NT 6.2) AppleWebKit/538.1.1 (KHTML, like Gecko) Chrome/29.0.874.0 Safari/538.1.1", "2020-05-23 14:29:44"),
  ("/search?query=foobar", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_6 rv:3.0; AS) AppleWebKit/536.2.2 (KHTML, like Gecko) Version/5.0.5 Safari/536.2.2", "2020-03-10 12:37:20");
