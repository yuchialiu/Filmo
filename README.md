# ![filmo_logo (3)](https://user-images.githubusercontent.com/105041441/196049846-8c99e3aa-f841-411c-812d-dad48e68f2e9.png)


[Filmo](https://filmo.site/) is a multi-language movie information website for everyone to share reviews.

## Introduction

Demo: https://filmo.site/

Designed for searching movie information and submitting movie reviews. We support three languages including English, Mandarin and French. In addation, the movie reviews were set in spoiler alert mode. You could read the reviews whenever you're ready!

Deployed to Amazon EC2, the data was managed by Amazon RDS MySQL, and the images were intergrated on Amazon S3 and we utilized Amazon CloudFront to speed-up efficiency of loading images.
## Features

- Multi-language Support
    - EN : English
    - ZH : Chinese Traditional (繁體中文)
    - FR : French (Français)
    
- Reivew Spolier Alert 

- Saving Favorite Reviews and Movies

## Usage

- Suggested Screen Size

  1280 x 720

- Language Setting 

  Hover over the drop-down language list on upper right corner of the website and choose the language you preferred.
  
  ![filmo_locale](https://user-images.githubusercontent.com/105041441/196049929-8451cb88-6972-4c44-8e4f-54071265cd7b.gif)

- Login / Sign Up Toggle
 
  Click on the arrow.
  
  ![filmo_login](https://user-images.githubusercontent.com/105041441/196049939-95462bd8-7a70-4849-8e85-55ecf3125aa1.gif)

- Login with Default Test Account
   
  - Email: ellie@gmail.com
  - Password: 12345678

- Turn off Spoiler Alert

  Click on the toggle switch and the reviews will show up.

  ![filmo_spoiler](https://user-images.githubusercontent.com/105041441/196049943-d387c115-0e5e-4dfb-9a3a-cf8a443a37a3.gif)

## Built With
- Backend
    [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/en/) 
    [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
    [![Pug](https://img.shields.io/badge/Pug-E3C29B?style=for-the-badge&logo=pug&logoColor=black)](https://pugjs.org/api/getting-started.html)

- Database
    [![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

- Frontend
    [![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white)](https://jquery.com/)
    [![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

- Cloud Service
    [![Amazon_AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/tw/)

## Architecture

- Website

![filmo_website](https://user-images.githubusercontent.com/105041441/196049964-aa711669-69db-4f67-9e23-aa8b9b755be0.jpg)

- Server

![filmo_server](https://user-images.githubusercontent.com/105041441/196049972-d88cda8f-24c7-4646-9752-c903196d282b.jpg)

- Table Schema

![filmo_schema](https://user-images.githubusercontent.com/105041441/196049977-dfc02807-ffcc-4cd4-86f3-f20eddfdef28.png)

## Roadmap

To improve the website, here are the future features below:

 - [ ]  Movie Sorted by Genre
 - [ ]  Movie Rating
 - [ ]  Review Ranking
 - [ ]  Comment under Reviews
 - [ ]  Comment Ranking 

## Contact

Ellie - ellieliu128@gmail.com

## Acknowledgements

 - Movie Data Source : [TMDB](https://www.themoviedb.org/documentation/api)
