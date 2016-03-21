use account;
drop table if exists users;
CREATE TABLE `users` (
  `id` int(31) NOT NULL AUTO_INCREMENT,
  `phonenumber` varchar(45) DEFAULT NULL,
  `imei` varchar(45) DEFAULT NULL,
  `macaddress` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `avatarid` int(31) DEFAULT NULL,
  `createtime` timestamp NULL,
  `lastlogintime` timestamp NULL,
  `logintimes` int(31) DEFAULT 0,
  `activestatus` int(11) DEFAULT NULL,
  `activecode` varchar(10) DEFAULT NULL,
  `baoxianid` varchar(64) DEFAULT NULL,
  `city` varchar(64) DEFAULT NULL,
  `province` varchar(64) DEFAULT NULL,
  `address` varchar(128) DEFAULT NULL,
  `company` int(31) default -1,
  `suoyouyongjin` float DEFAULT 0,
  `benyuedaitixian` float default 0,
  `benyueyongjin` float default 0,
  `benyuedingdan` int(31) default 0,
  `isnew` int(1) default 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX users_phonenumber ON users (phonenumber);

drop table if exists accesstoken;
CREATE TABLE `accesstoken` (
  `id` int(31) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `accesstoken` varchar(45) NOT NULL,
  `createtime` timestamp NULL DEFAULT 0,
  `isdelete` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX accesstoken_userid ON accesstoken (userid);

drop table if exists insorder;
CREATE TABLE `insorder` (
  `id` int(31) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `status` varchar(45) NOT NULL,
  `createtime` timestamp NULL DEFAULT NULL,
  `tbname` varchar(45) NOT NULL,
  `tbage` int(11) NOT NULL,
  `tbsex` int(11) NOT NULL,
  `tbduration` int(11) NOT NULL,
  `baoe` float default 0,
  `baofei` float default 0,
  `yongjin` float default 0,
  `productid`  int(31) NOT NULL,
  `productname`  varchar(128) NOT NULL,
  `productlogourl`  varchar(128) NOT NULL,
  `cancancle`  varchar(128) NOT NULL,
  `can`  varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX insorder_userid ON insorder (userid);
CREATE INDEX insorder_userid_createtime ON insorder (userid,createtime);

drop table if exists orderstatus;
CREATE TABLE `orderstatus` (
  `id` int(31) NOT NULL AUTO_INCREMENT,
  `insorderid` int(11) NOT NULL,
  `status` varchar(45) NOT NULL,
  `createtime` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists product;
CREATE TABLE `product` (
  `productid` int(32) NOT NULL,
  `fullname` varchar(128) NOT NULL default "",
  `companyid` int(32) NOT NULL ,
  `slogan` varchar(1024) NOT NULL,
  `title` varchar(256) NOT NULL default "",
  `pdfurl` varchar(256) NOT NULL default "",
  `con` TEXT NOT NULL default "",
  `type1` int(32) NOT NULL,
  `type2` int(32) NOT NULL,
  `type3` int(32) NOT NULL default 0,
  `tags` varchar(1024) NOT NULL default "",
  `status` int(4) NOT NULL default 0,
  `logourl` varchar(256) NOT NULL default "",
  `ishot` tinyint(1) NOT NULL default 0,
  `isnew` tinyint(1) NOT NULL default 0,
  `issell` tinyint(1) NOT NULL default 0,
  `isfujia` tinyint(1) NOT NULL default 0,
  `detail` TEXT NOT NULL default "",
  `human` int(32) NOT NULL default 0,
  `proto` TEXT NOT NULL,
   PRIMARY KEY (`productid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists planbook;
CREATE TABLE `planbook` (
  `id` varchar(128) NOT NULL,
  `userid` int(11) NOT NULL,
  `productid`  int(31) NOT NULL,
  `createtime` timestamp NULL DEFAULT NULL,
  `tbname` varchar(45) NOT NULL,
  `tbage` int(11) NOT NULL,
  `tbsex` int(11) NOT NULL,
  `tbduration` int(11) NOT NULL,
  `baoe` float default 0,
  `baofei` float default 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;