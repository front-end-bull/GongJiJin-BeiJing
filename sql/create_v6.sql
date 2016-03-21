use account;
drop table if exists huafeipromote;
CREATE TABLE `huafeipromote` (
  `id` int(31) NOT NULL AUTO_INCREMENT,
  `userid` int(31) NOT NULL,
  `status` int(11) NOT NULL,
  `createtime` timestamp NULL DEFAULT NULL,
  `promoteid`  int(31) NOT NULL DEFAULT 0,
  `cost` int(31) NOT NULL,
  `iszhifu` int(11) NOT NULL DEFAULT 0,
  `chongzhitime` timestamp NULL DEFAULT NULL,
  `username` varchar(255) DEFAULT "",
  `phonenumber` varchar(45) DEFAULT NULL,
   `promoteusername` varchar(255) DEFAULT "",
   `promotephonenumber` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
