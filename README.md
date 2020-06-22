# wie-bi04
Web and Internet Engineering project 2019/2020

## How To

### We need one person logging in as a professor.
Please connect to https://wie-bi04.firebaseapp.com/
Login as professor email: *acrea@unibz.it* psw: *test1234*
Select how to create groups.
Please refer to the video https://scientificnet-my.sharepoint.com/:v:/g/personal/vbelingheri_unibz_it/ERsBZONjuCxMr-skHC5nKDABB9jyg0yeq4fQJd7Z6xFwYw?e=df0t6F for more information.
Once groups are created, click on "SET TIMER" and select an amount of minutes.
Click on "START": rooms created.

As a professor it is possible to **join** a room by clicking on _Join_ of the interested group.
In the **Notifications** section the professor will receive requests from the groups.
Requests are of two types: help or time.
Accepting a request for time will increase the timer.
Accepting a request for help will connect the professor to the room.
The professor can also choose to dismiss the notifications.

### Connecting as student
Please connect to https://wie-bi04.firebaseapp.com/
Login as student: please refer to the file _users.txt_ so to have a list of email credentials. The password will always be *test1234*.
Once a user is connected as a student he/she will remain in a _Waiting Room_ until a room for his/her account is created.
Once the room is created the connection with the room will established.

### In the Room
More time can be requested using the select on top of the page.
Users can mute/unmute mic, stop/start their video streaming and request help (question mark icon).

### Assign students to professor
When connected as a professor, click on *Teaching* link in the navbar.
Here it is possible to select a professor and then select the students to assign.
It is also possible to remove students already assigned.
*Notice: we thought of this feature being used by secretariat staff.*

### Add a new professor or student
When connected as a professor, click on *Sign Up* link in the navbar.
*Notice: we thought of this feature being used by secretariat staff.*

### Disclaimer and problems known
**A WEBCAM IS REQUIRED TO ACCESS THE SERVICE**

**USE A PAIR OF HEADPHONES TO HAVE A GOOD EXPERIENCE**


Please notice that the technology for the video/audio transmission is highly dependant on the browser and platform/OS used.
For instance: Chrome on iOS will not work. Safari will, but on some iOS/Safari version, due to limitations imposed by Apple, no more than one video+audio can be riproduced on the same page. 

A problem that can occur is the impossibility to start a video/audio transmission between some users, hence: the layout of the room updates but no video/audio starts.
This is due to the way the connection is reached.
To establish the connection we need to rely on STUN servers in order to "surpass" some limitations of the user's connection (Firewall, NAT configurations etc.). However STUN servers can fail, and we should rely on TURN servers: they relay data between users.
We did not find any reliable free TURN server, so it can happen that the video communication will not start.
Sometimes refreshing the page fix the problem, sometimes does not.


More on the technology https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/

