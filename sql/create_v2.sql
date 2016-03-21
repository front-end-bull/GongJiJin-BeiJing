use account;
drop table if exists planbook;
CREATE TABLE `planbook` (
  `id` varchar(128) NOT NULL,
  `userid` int(11) NOT NULL,
  `raw`  TEXT NOT NULL,
  `content`  TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;