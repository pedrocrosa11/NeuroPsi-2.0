
create table Location (locId int auto_increment primary key, coords point);
create table User (userId int auto_increment primary key, name varchar (30), pass varchar (200), sex enum("M", "F"), email varchar (30), birthdate date, user_locId int, foreign key (user_locId) references Location (locId));
create table Patient (patientId int auto_increment primary key, patient_userId int, foreign key (patient_userId) references User (userId));
create table Neuropsi (neuroId int auto_increment primary key, neuro_userId int, foreign key (neuro_userId) references User (userId));
create table File (fileId int auto_increment primary key, creationDate date, log varchar (300), file_patientId int unique, foreign key (file_patientId) references Patient (patientId));
create table Attribution (attribId int auto_increment primary key, attrib_fileId int, attrib_neuroId int, foreign key (attrib_fileId) references File (fileId), foreign key (attrib_neuroId) references Neuropsi (neuroId));
create table Route (routeId int auto_increment primary key, waypoints longtext, time float, distance float, route_locId int, foreign key (route_locId) references Location (locId));
create table Test (testId int auto_increment primary key, testState enum("Pending", "Completed", "Filed", "Reschedule", "Canceled") default "Pending", assignedDate date, completedDate date, test_attribId int, test_routeId int, foreign key (test_attribId) references Attribution (attribId), foreign key (test_routeId) references Route (routeId));
create table Rey (reyId int auto_increment primary key, rec longtext, comment varchar(300), rey_testId int, foreign key (rey_testId) references Test (testId));
create table Discalculia (discalcId int auto_increment primary key, firstNumber int, sign char, secondNumber int, result int, correctAnswer int, comment varchar(300), discalc_testId int, foreign key (discalc_testId) references Test(testId));
create table Reschedule (reschedId int auto_increment primary key, resched_testId int, resched_newTestId int unique, foreign key (resched_testId) references Test (testId), foreign key (resched_newTestId) references Test (testId));

insert into Location (coords) values (point(-9.157689, 38.779941));
insert into User (name, sex, email, birthdate, user_locId) values ("Diego Santos Rocha", "M", "dsr@gmail.com", '1941-09-09', 1);
insert into Patient (patient_userId) values (1);
insert into File (creationDate, file_patientId) values (CURRENT_DATE(), 1);

insert into Location (coords) values (point(-9.10697, 38.770611));
insert into User (name, pass, sex, email, birthdate, user_locId) values ("Lucas Souza Gomes", "100$10$4cc646303199ff57a154035f4089768f", "M", "lsg@gmail.com", '1988-12-24', 2);
insert into Patient (patient_userId) values (2);
insert into File (creationDate, file_patientId) values (CURRENT_DATE(), 2);

insert into Location (coords) values (point(-9.165965, 38.672674));
insert into User (name, sex, email, birthdate, user_locId) values ("Luís Melo Rocha", "M", "lmr@gmail.com", '1967-12-25', 3);
insert into Neuropsi (neuro_userId) values (3);

insert into Location (coords) values (point(-9.131448, 38.720356));
insert into User (name, pass, sex, email, birthdate, user_locId) values ("Clara Barbosa Almeida", "100$10$135532065b39a4f88be9c7b9a3b78207", "F", "cba@gmail.com", '1980-10-12', 4);
insert into Neuropsi (neuro_userId) values (4);

insert into Attribution (attrib_fileId, attrib_neuroId) values (1, 1);
insert into Attribution (attrib_fileId, attrib_neuroId) values (2, 2);
insert into Attribution (attrib_fileId, attrib_neuroId) values (1, 2);
insert into Attribution (attrib_fileId, attrib_neuroId) values (2, 1);

insert into Route (route_locId) values (1);
insert into Route (route_locId) values (2);
insert into Route (route_locId) values (3);
insert into Route (route_locId) values (4);

insert into Test (test_attribId, assignedDate, test_routeId) values (1, CURRENT_DATE(), 1);
insert into Test (test_attribId, assignedDate, test_routeId) values (2, CURRENT_DATE(), 3);
insert into Test (test_attribId, assignedDate, test_routeId) values (3, CURRENT_DATE(), 2);
insert into Test (test_attribId, assignedDate, test_routeId) values (4, CURRENT_DATE(), 2);
insert into Test (test_attribId, assignedDate, test_routeId) values (4, CURRENT_DATE(), 2);
insert into Test (test_attribId, assignedDate, test_routeId) values (4, CURRENT_DATE(), 2);
insert into Test (test_attribId, assignedDate, test_routeId) values (4, CURRENT_DATE(), 4);
insert into Test (test_attribId, assignedDate, test_routeId) values (4, CURRENT_DATE(), 4);
insert into Test (test_attribId, assignedDate, test_routeId) values (4, CURRENT_DATE(), 3);





