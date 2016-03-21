use account;
drop table if exists news;
CREATE TABLE `news` (
  `id` int(31) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(128) NOT NULL,
  `short_content`  VARCHAR(128) NOT NULL,
  `views`  INT(63) NOT NULL,
  `content`  TEXT NOT NULL,
  `iconurl`  VARCHAR(255) NOT NULL,
  `url`  VARCHAR(255) NOT NULL,
  `createtime` int(64) NULL DEFAULT NULL,
  `type` int(11) NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;