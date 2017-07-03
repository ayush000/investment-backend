CREATE TABLE `funds` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `value` float NOT NULL,
  `date` date NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=68462 DEFAULT CHARSET=utf8;
CREATE TABLE `user_funds` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `units` float unsigned NOT NULL DEFAULT '0',
  `fund_name` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `fund_name` (`fund_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;