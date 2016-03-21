use account;
ALTER TABLE users ADD `status` int(11) default 0;
ALTER TABLE users ADD `shengfenzheng` varchar(20) default "";
ALTER TABLE users ADD `promotecode` int(31) default 0;
ALTER TABLE users ADD `authtime` timestamp NULL;
