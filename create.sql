use account;
drop table if exists users;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phonenumber` varchar(45) DEFAULT NULL,
  `imei` varchar(45) DEFAULT NULL,
  `macaddress` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `avatarid` int(11) DEFAULT NULL,
  `createtime` timestamp(6) NULL DEFAULT NULL,
  `lastlogintime` timestamp(6) NULL DEFAULT NULL,
  `logintimes` timestamp(6) NULL DEFAULT NULL,
  `isactive` int(1) DEFAULT NULL,
  `activecode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


drop table if exists accesstoken;
CREATE TABLE `accesstoken` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `accesstoken` varchar(45) NOT NULL,
  `createtime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `isdelete` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

