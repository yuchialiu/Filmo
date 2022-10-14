# Filmo

[Filmo](https://filmo.site/) is a multi-language movie information website for everyone to share reviews.


## Introduction

Demo: https://filmo.site/

Filmo was designed for searching movie information and submitting movie reviews. We support three languages including English, Mandarin and French. In addation, the movie reviews were set in spoiler alert mode. You could read the reviews whenever you're ready!

Filmo was deployed to Amazon EC2, the data was managed by Amazon RDS MySQL, and the images were intergrated on Amazon S3 and we utilized Amazon CloudFront to speed-up efficiency of loading images.
## Features

- Multi-language Support
    - EN : English
    - ZH : Chinese Traditional (繁體中文)
    - FR : French (Français)
- Reivew spolier alert 
- Save favorite review and movie
## Usage

- Suggested screen size

  1280 x 720

- Language Setting 

  Hover over the drop-down language list on upper right corner of the website and choose the language you preferred.

- Login with Default Test Account
   
  - Email: ellie@gmail.com
  - Password: 12345678

- Turn off Spoiler Alert

  Click on the toggle switch and the reviews will show up.


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

- Cloud Service (AWS)
    [![Amazon_AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/tw/)

## Architecture

- Website
  
  coming soon 

- Server

  coming soon 
  
- Table Schema

  coming soon 
  
## Contact

Ellie - ellieliu128@gmail.com
## Acknowledgements

 - Movie data source : [TMDB](https://www.themoviedb.org/documentation/api)
