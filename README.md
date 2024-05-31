## GUD - Gamified User Development

## Project Description:
DTC-14 is developing a web application to help gamers, both casual and hardcore, lead healthy and active lifestyles by gamifying their lifestyle with the performance statistics they enjoy in their favorite games and then combining them with their actual in-game performance so they can “git gud” in all aspects of their life.

## About Us
Team Name: DTC-14
Team Members: 
- Ephraim Hsu
- Tommy Ju
- Alzen Landayan
- Michael McBride
- Matthew Yoon

## Technologies used

Programming Languages:
- [HTML 5](https://www.w3schools.com/html/)
- [W3.CSS 4.15](https://www.w3schools.com/css/)
- [Javascript ECMAScript 2020](https://www.w3schools.com/js/)

IDEs:
- [Microsoft Visual Studio 2022](https://visualstudio.microsoft.com/)

Runtime Environments:
- [NodeJS v20.13.1](https://nodejs.org/en)

Database: 
- [MongoDB 7.0 - 2023](https://www.mongodb.com/)

Utilities:
- [Zoom 5.17.11](https://zoom.us/)
- [Slack 4.38.127](https://slack.com/)
- [Figma](https://www.figma.com/)
- [Trello](https://trello.com/)
- [Discord 1.0.9011](https://discord.com/)

- [NPM 10.8.1](https://www.npmjs.com/)
- [Copilot 1.197.0](https://github.com/features/copilot)
- [git 2.45.1](https://git-scm.com/)

Styling:
- [TailwindCSS 3.4.3](https://tailwindcss.com/)
- [Flowbite 2.3.0](https://flowbite.com/)
- [ApexCharts 3.49.1](https://apexcharts.com/)

NPM Packages:
- [apexcharts 3.49.1](https://www.npmjs.com/package/apexcharts)
- [axios 1.6.8](https://www.npmjs.com/package/axios)
- [bcrypt 5.1.1](https://www.npmjs.com/package/bcrypt)
- [bottleneck 2.19.5](https://www.npmjs.com/package/bottleneck)
- [connect-mongo 5.1.0](https://www.npmjs.com/package/connect-mongo)
- [cors 2.8.5](https://www.npmjs.com/package/cors)
- [dotenv 16.4.5](https://www.npmjs.com/package/dotenv)
- [ejs 3.1.10](https://www.npmjs.com/package/ejs)
- [express-session 1.18.0](https://www.npmjs.com/package/express-session)
- [gitignore 0.7.0](https://www.npmjs.com/package/gitignore)
- [joi 17.13.1](https://www.npmjs.com/package/joi)
- [mongodb 6.6.1](https://www.npmjs.com/package/mongodb)
- [mongoose 8.3.5](https://www.npmjs.com/package/mongoose)
- [node 20.13.1](https://www.npmjs.com/package/node)
- [nodemon 3.1.2](https://www.npmjs.com/package/nodemon)
- [readline 1.3.0 ](https://www.npmjs.com/package/readline)
- [serve-favicon 2.5.0](https://www.npmjs.com/package/serve-favicon)
- [tailwindcss 3.4.3](https://www.npmjs.com/package/tailwindcss)

APIs:
- [OpenWeatherMap 3.0](https://openweathermap.org/)
- [ChatGPT 4.0.0](https://platform.openai.com/docs/overview)
- [RiotAPI - Account-V1](https://developer.riotgames.com/)
- [RiotAPI - League-V4](https://developer.riotgames.com/)
- [RiotAPI - Match-V5](https://developer.riotgames.com/)
- [RiotAPI - Summoner-V4](https://developer.riotgames.com/)

Our Websites:
- [GUD App](https://two800-202410-dtc14.onrender.com/)
- [Github Repo](https://github.com/TommyJu/2800-202410-DTC14/tree/dev)
- [Google Drive](https://drive.google.com/drive/folders/1zTf8fKFSBhaj_pGA8hPnRvvesX9evUct?usp=sharing)
- [FigJam](https://www.figma.com/board/UleQygiIcOihk7g9SDWQ10/2800-202410-DTC14?node-id=0-1&t=KrVbZLyiDg6QQdBQ-0)
- [Trello](https://trello.com/b/qmC5fiAS/2800-202410-dtc14)

## Set up Instructions
Assumptions: 
 - You are a developer with some experience or understanding of HTML, CSS, and Javascript languages.  
 - You have some experience or understanding of a VCS (Version Control System). You know what clone, commit, pull, and push mean.  
 - You have experience or understanding of Gitflow Workflow.  You know what branch, merge, dev, and main mean.
 - You know what the Node runtime environment is.
 - You have experience with databases.  Knowing MongoDB is a bonus!
 - You are a PC user.  All keyboard commands given will be based on PC.  You will need to look up the equivalent for Mac or Linux if you are using those operating systems.

1. It is recommend that you download and install an IDE that can handle HTML, Javascript, CSS, and EJS files at a minimum.  Microsoft Visual Studio, listed above, would be a good choice.  These remaining instructions will assume you are using Visual Studio. Installing to the default directory on your computer is fine.
2. Next you should install git on your computer if you haven't already. See the link above to install it.  Once again, the default directory when you run the installer is fine.
3. You will need to set up a MongoDB account to access our database information.  Use the link above to set up your account, and then contact Matthew at the email in the Contact Information to get the right permissions to work with our database.
4. Since you found this repository from Github, you most likely have a Github account.  If you do not, you will need to create a new account on Github (see link above).  
5. Next, you should clone our project repo (see the link under Our Websites). Make sure that when you select the directory to clone the repo to, you use a local drive on your computer (C: or D:). Do not use a network or cloud folder!  Cloning should always be done to your local machine!
6. Before getting into the project, you need to install NodeJS as well as NPM (Node Package Manager).  See the links in the Technologies Used section above for instructions on how to do this.
7. While not required, it is recommended that you install the following extensions in Visual Studio to make navigating the project easier: Github Copilot, Live Server, MongoDB for VS, and Tailwind CSS Intellisense.  You can look up online how to install extensions in Visual Studio.
8. Next, open the terminal in Visual Studio using Ctrl + Shift + `.  This will open a powershell terminal within Visual Studio at the directory of the your cloned repo. 
9. In the ternminal, run the command: npm init.  This will create a package.json and package-lock.json file in your directory. This is expected.
10. In the terminal run the command: npm install.  This will start a install procedure where all of the necessary node modules needed for the website are installed in your repo directory in the node_modules folder.  This will also populate your package.json and package-lock.json files to match our project. If you are ever in doubt if you have the necessary modules, review these folders and you can manual install them using command: npm i <module name>
11. While not required, it is recommend that you install nodemon using: npm i nodemon.  Nodemon is similar to node, but more advanced in that it will restart the server code if there are any changes to any of the files in the repo.
12. Before you run the program for the first time, you will need to set up your local .env file.  This is where all necesary keys, passwords, and secrets are stored.  By running the "npm install" command, a .env file should have been created, but if not, just create a new file through Visual Studio or your IDE as a ".env", no name added to this.  Your .env file should have the following variable definitions as text:
MONGODB_HOST=\
MONGODB_USER=\
MONGODB_PASSWORD=\
MONGODB_DATABASE=\
MONGODB_SESSION_SECRET=\
NODE_SESSION_SECRET=\
OPEN_WEATHER_API_KEY=\
OPENAI_API_KEY=\
DAILY_RIOT_API_KEY=\

13. For the mongodb and Node values, contact Matthew in the Contact Information to get this information.  For the OpenWeatherAPI key and OpenAI key, contact Michael.  For the Riot API key, contact Ephraim. If you want, you can also request your own keys for each of the APIs, using the links given above in the Technologies Used section. Note, the only version of the Riot API key you can get without the project is one that expires 24 hours after generation.

14. You can start the app locally by using the command: nodemon index.js.  From there, you type in localhost/3000.  Make sure you've pulled the latest code from the branch you are on.

15.  If you'd like to work on creating new features, it is recommended you create a new branch off of the dev branch where you can work on your own features without disturbing the code of others.

16.  If you have any question, PLEASE REACH OUT!  The Contact Information below provides our first source of contact, but from there we can set you up with Discord and/or Slack if those are your preferred communication streams.  We use them all!


## Testing
- [Testing Log](https://docs.google.com/spreadsheets/d/1s7U9PNt-C_CLHe35D92rPmViHjbnB3pAfi7hmVTAtvA/edit?usp=sharing)

## Features/User Guide

### Sign Up Page
#### Create a new account:  
1. If you are logged out, you can create a new user by clicking "Sign Up".
1. Enter a unique username no longer than 20 characters with alphanumerical characters only.
2. Create a password no longer than 20 characters, special characters are allowed.
3. Select a security question in case you forget your password.
4. Provide an answer to your security question that you will remember. Alphanumerical characters only with a max length of 20.
5. (Optional) provide a Riot username associated with your League of Legends account.
5. (Optional) provide a Riot ID associated with your League of Legends account.
5. (Optional) enter in the name of the closest city for weather data that will be used to suggest physical activites.

```
(Example valid Riot credentials)

Riot Username: Sheiden

Riot ID: 0001
```

### Password Recovery
#### Reset your password using your security question:

1. Navigate to the login page.
2. Click "Forgot Password?".
3. Enter in your username.
4. Provide your security answer and a new password.
5. Click submit.

### Home Page
#### View your level progress:
1. Hover your mouse over the donut chart to see your progress in each category.

#### View your achievements:
1. Hover your mouse over your achievement badges to read their descriptions.

### Profile Page
#### Log out of app:
1. Click the red "Log Out" button at the bottom of the page.

### Game Page
#### Search for a summoner (League of Legends player) using their Riot username and Riot ID:
1. Find the "Look up a summoner!" form.
1. Enter in a valid Riot username.
1. Enter in a valid Riot ID.
1. Click "Search for summoner".

```
(Example valid Riot credentials)  

Riot Username: Sheiden  

Riot ID: 0001
```

#### Create a custom task:  

1. Click "Add Task"
2. Enter a title for your task.
3. Enter a description for your task.
4. Select your task category.
5. Click "Add".

#### Update a task:  
1. Click the green checkmark to complete a task OR the red "x" to delete a task.

> Completing a task will give you experience for the corresponding category. Deleting will simply remove the task.

#### Add a suggested task to your tasks:
1. Click the blue plus icon to move the suggested task to your tasks to complete.

#### View completed tasks:
1. Click "Completed Tasks".

### Diet Page
#### Generate a food recipe:
1. Select a meal from the drop down menu (breakfast, lunch, dinner, etc.)
2. Click the "Generate Recipe" button.

#### Add food allergies to your account:
1. Click "Edit Allergies".
2. Enter your allergy into the text input.
3. Click "Save".

> Allergies will be saved to your account for future food recipes.

#### Favourite a recipe:
1. Generate a food recipe.
2. Click "Add to favourites" at the bottom of the recipe description.
3. View or delete your favourite recipes by clicking the "Favourites" button.

#### Add a recipe to your To-Do list for completion:
1. Generate a food recipe.
2. Click "Add to to-do list" at the bottom of the recipe description.
3. Click "To-Do list" to view your recipes to complete.
4. Click "Complete" to complete the task and gain exp, clicking "Remove" will simply remove the recipe from your to-do list.

Note: Recipes can also be added to the to-do list from the favourite recipes modal.

#### View completed tasks:
1. Click "Completed Tasks".

### Fitness Page


#### Create a custom task:  

1. Click "Add Task"
2. Enter a title for your task.
3. Enter a description for your task.
4. Select your task category.
5. Click "Add".

#### Update a task:  
1. Click the green checkmark to complete a task OR the red "x" to delete a task.

> Completing a task will give you experience for the corresponding category. Deleting will simply remove the task.

#### Add a suggested task to your tasks:
1. Click the blue plus icon to move the suggested task to your tasks to complete.


#### View completed tasks:
1. Click "Completed Tasks".

### Friends Page
#### Send a friend request:
1. Enter in your friend's username into the corresponding text input.
2. Click "Add friend".

#### Filter friend requests:
1. Enter in your friend's username into the corresponding text input.
2. Click "Search requests".

#### Filter friends list:
1. Enter in your friend's username into the corresponding text input.
2. Click "Search friends".

#### Clear friends list or friend request filters:
1. Click "Clear search"

#### Delete a friend:
1. Click "Delete" on the corresponding friend card.

## References

- [Goku Graphic](https://www.textstudio.com/)
- [Sonic and Knuckles Graphic](https://www.textstudio.com/)
- [Home Graphic](https://www.textstudio.com/)
- [Gameboy Graphic](https://www.textstudio.com/)
- [Pizza Graphic](https://www.textstudio.com/)
- [GUD Logo Graphic](https://www.textstudio.com/)
- [Favicon](https://www.favicon.cc/)
- [Task Card Emojis](https://emoji.aranja.com/)
- [League of Legends Resources - Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- [Codepen - Weather Icons](https://codepen.io/idifyable/pen/gmPjQK?editors=0010)
- [CSS Scan](https://getcssscan.com/css-buttons-examples)
- [Google Icons](https://fonts.google.com/icons)
- [Google Fonts](https://fonts.google.com/)

## AI Implementation
As one of our core features, we used ChatGPT to generate custom recipes based on prompt we give it with filters by meal type (breakfast, lunch, dinner, snack) as well as accounting for any food allergies the user specifies.  We then take that recipe text and store it to our database for use later in favoriting a recipe and adding the recipe to the to-do list so you can complete it and gain experience.

Additionally, we used ChatGPT and Copilot to assist with code completion.  Copilot was used for auto-completing code lines after reading them over to confirm they will create the desired outcome.  In almost all cases, we couldn't use the Copilot suggestion as printed, and we had to adjust values or logic to match our desired outcome.  For ChatGPT, we used it for assisting with debugging to identify syntax errors or logic errors with our code due to complexity.  A specific example was finding a way to disable buttons to prevent double click errors across all of our pages.

We did encounter limitations of AI because Copilot and ChatGPT didn't generate exactly the code we needed in most cases.  It worked fine for our recipe generation, but generally AI responses had to be parsed and edited to make sure it worked with the rest of our code and produced the desired outcome.

## Project Files
```
.
├── README.md
├── about.html
├── achievement_functions.js
├── authentication_functions.js
├── databaseConnection.js
├── friend_functions.js
├── index.js
├── level_functions.js
├── login
│   ├── answer.png
│   ├── city.png
│   ├── email.png
│   ├── home_background2.jpg
│   ├── login_signup_style.css
│   ├── password.png
│   ├── riot.png
│   ├── security.png
│   ├── try.jpeg
│   └── user.png
├── package-lock.json
├── package.json
├── public
│   ├── client-side-scripts
│   │   ├── button_functions.js
│   │   ├── event_listeners.js
│   │   └── stats.js
│   ├── css
│   │   ├── achievements.css
│   │   ├── completed.css
│   │   ├── friends.css
│   │   ├── game.css
│   │   ├── home_page.css
│   │   ├── level_up.css
│   │   ├── profile.css
│   │   ├── progress_bar.css
│   │   ├── style.css
│   │   └── tooltip.css
│   ├── footer-icons
│   │   ├── LOL.mp3
│   │   ├── fork-and-spoon.svg
│   │   ├── games.svg
│   │   ├── group.svg
│   │   ├── home.svg
│   │   └── walk-directions.svg
│   ├── footer-icons-v2
│   │   ├── diet.png
│   │   ├── fitness.png
│   │   ├── friends.png
│   │   ├── game.png
│   │   └── home.png
│   └── images
│       ├── backgrounds
│       │   ├── home_background2.jpg
│       │   ├── home_background3.jpg
│       │   ├── level_up_background.jpg
│       │   ├── profile_background.jpg
│       │   └── profile_background2.jpg
│       ├── favicon.ico
│       ├── friendIcons
│       ├── gud_logo.png
│       ├── level-up
│       │   ├── diet.gif
│       │   ├── fitness.gif
│       │   └── game.gif
│       ├── logo.png
│       ├── ranks
│       │   ├── 20560797_hexa_dan_wave_10.jpg
│       │   ├── bronze.webp
│       │   ├── gold.webp
│       │   ├── silver.webp
│       │   └── unranked.webp
│       └── taskCardIcons
│           ├── 100.png
│           ├── American_Football.png
│           ├── BRONZE.png
│           ├── Badminton.png
│           ├── Baseball.png
│           ├── Boxing.png
│           ├── CHALLENGER.png
│           ├── Cricket.png
│           ├── Cycling.png
│           ├── DIAMOND.png
│           ├── EMERALD.png
│           ├── Field_Hockey.png
│           ├── GOLD.png
│           ├── GRANDMASTER.png
│           ├── Golf.png
│           ├── Gymnastics.png
│           ├── IRON.png
│           ├── Ice_Hockey.png
│           ├── Indoor_Basketball.png
│           ├── Indoor_Volleyball.png
│           ├── MASTER.png
│           ├── MMA_(Mixed_Martial_Arts).png
│           ├── Outdoor_Basketball.png
│           ├── Outdoor_Volleyball.png
│           ├── PLATINUM.png
│           ├── Rugby.png
│           ├── SILVER.png
│           ├── Skiing.png
│           ├── Snowboarding.png
│           ├── Soccer(Football).png
│           ├── Surfing.png
│           ├── Swimming.png
│           ├── Table_Tennis.png
│           ├── Tennis.png
│           ├── Track_and_Field.png
│           ├── UNRANKED.png
│           ├── Wrestling.png
│           └── pencil2.png
├── riotLeagueAPI.js
├── stats_send.js
├── tailwind.config.js
├── task_functions.js
├── utils.js
├── views
│   ├── 404_not_found.ejs
│   ├── diet.ejs
│   ├── diet_completed.ejs
│   ├── fitness.ejs
│   ├── fitness_completed.ejs
│   ├── fitness_weather.ejs
│   ├── friends.ejs
│   ├── game.ejs
│   ├── game_completed.ejs
│   ├── home_logged_out.ejs
│   ├── invalid_log_in.ejs
│   ├── invalid_password_recovery.ejs
│   ├── invalid_sign_up.ejs
│   ├── level_up.ejs
│   ├── log_in.ejs
│   ├── password_recovery.ejs
│   ├── profile.ejs
│   ├── security_question.ejs
│   ├── sign_up.ejs
│   ├── stat_summary.ejs
│   ├── successful_password_recovery.ejs
│   ├── template.ejs
│   └── templates
│       ├── achievement.ejs
│       ├── achievement_logo_only.ejs
│       ├── achievements_container.ejs
│       ├── achievements_container_preview.ejs
│       ├── easter_footer.ejs
│       ├── footer.ejs
│       ├── friends
│       │   ├── friend_card.ejs
│       │   ├── friend_card_container.ejs
│       │   ├── friend_request.ejs
│       │   └── invalid_friend_request.ejs
│       ├── game
│       │   ├── helpfulMessage.ejs
│       │   ├── searchSummonerButton.ejs
│       │   ├── summonerGameStats.ejs
│       │   └── userGameStats.ejs
│       ├── header.ejs
│       ├── header_logo_only.ejs
│       ├── header_with_profile.ejs
│       ├── nav_footer.ejs
│       ├── nav_logo_only.ejs
│       ├── nav_with_profile.ejs
│       ├── task_card.ejs
│       ├── task_cards_container.ejs
│       └── task_modal.ejs
└── weather.js
```

## Contact Information
Ephraim Hsu - ehsu18bcit@gmail.com\
Tommy Ju - tju1@my.bcit.ca\
Alzen Landayan - alzenlandayan1616@gmail.com\
Michael McBride - mcbride1987@gmail.com\
Matthew Yoon - myoon928@gmail.com