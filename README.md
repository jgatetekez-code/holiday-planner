Holiday and Long-Weekend Planner

!.Project Overview

Holiday and Long-Weekend Planner is a web application that helps people find public holidays and plan their time off.

Users can select a country and a year to view public holidays. The application also identifies long weekends and suggests bridge days that people could take off to extend their breaks.

The application uses the Nager.Date REST API to retrieve holiday information.

Live website: https://www.kezajoyeuse.tech/holiday-planner/

Github repository: https://github.com/jgatetekez-code/holiday-planner

2.Features

. Select a country from a vailable countries.
.Select a year to view its public holidays.
.View holiday names, dates and holiday types.
.Identify holidays that create long weekends.
.Get suggestions for bridge days.
.Search holidays by name.
.Filter holidays by month and type.
.Show only long weekends or bridge-day suggestions.
.Sort holidays by date, name or longest break.
.Display error messages when the API cannot provide data.

3.Technologies Used

.HTML- provides the structure of the application.
.CSS- styles the application and its layout.
.javaScript-retrieves API data, processes holidays and handles user interactions.
.Nager.Date REST API- provides public holiday and country information.
.Nginx- serves the application on Web02.
.HAProxy- distributes incoming traffic between the two web servers.
.Git and GitHub- used for version control and source code hosting.

4. External API

This project uses the Nager.Date public holiday API.

API base URL: https://date.nager.at/Api


The application uses these endpoints:

Get /AvailableCountries

Returns the countries supported by the API.

Get public holidays

GET /publicHolidays/{year}/{countryCode}

Returns public holidays for the selected country and year.

The application does not require an API key or used login to access these endpoints.

API resources:

. Official project: https://github.com/nager/Nager.Date
. API website: https://date.nager.at

Credit goes to the Nager.Date developers for providing the public holiday data and API

5. Project Structure

holiday-planner/
|
|---index.html
|---style.css
|---app.js
|---.gitignore

6. Running the Application Locally

The application uses HTML, CSS and JavaScript.It does not require a backend server or database.

1.Clone the repository:

git clone https://github.com/jgatetekez-code/holiday-planner.git

2.Enter the project folder:

cd holiday-planner

3.Start a local server using Python:

python -m http.server 8000

4.Open this address in your browser:

http://localhost:8000

if your computer uses the Python laucher on windows,you can use:

py -m http.server 8000

Make sure you have an internet connection because the application retrieves holiday information from the external API.

7.Deployment Architecture

The application is deployed on two web servers behind a dedicated load balancer.

server             role

Web01               Hosts the application
Web02               Hosts the application
Lb01                Uses HAProxy to distribute traffic

The public aplication is accessed through:

https://www.kezajoyeuse.tech/holiday-planner/

8.Deployment Steps

Web01

1.Connect to Web01 using SSH.
2.clone the GitHub repository into /tmp/holiday-planner.
3.Create the application directory at /var/www/holiday-planner/.
4.Copy index.html, styles.css and app.js into that directory.
5.Set the correct ownership and the file permissions.
6..Test the application using the local server adress.

Web02

The same deployment process was followed on Web02.

The application files were copied into /var/www/html/holiday-planner/, and the ownership and permissions were configured for Nginx.

Both web servers were tested to comfirm that they could serve the application successfully.

9.Load Balancer Configuration

HAproxy is installed and running on Lb01.

ir receives incoming HTTPS requests and forwards them to the web servers.

The configuration uses:

.An HTTP frontend on port 80 that redirects requests to HTTPS.
.An HTTPS frontend on port 443
.An SSL certificate for  www.kezajoyeuse.tech.
.A backend containing Web01 and Web02.
.Round-robin balancing to distribute requests between the servers.

The backend servers are:

Web01: 52.56.201.56:80
Web02: 35.176.110.16:80

THE hapROXY BACKEND uses the following balancing method:

balance roundrobin

This allows requests to alternate between the two web servers.

10.Testing
The following tests were performed:

1.Confirmed that the application loads on Web01.
2.Confirmed that the application loads on Web02.
3.Checked that the HTML, CSS and javaScript files are accessible.
4.Checked that HAProxy is running.
5.Tested access through the load balancer.
6.Checked that HTTPS works through the domain.
7.Sent multiple requests and confirmed that traffic alternates between Web01 and Web02

The load-balancing test confirmed that both web servers were receiving requests.

11.Error Handling

The application handles several possible API problems:

.Network connection problems.
.API request timeouts.
.HTTP errors returned by the API.
.Missing holiday information
.Unexpected API response data.

When an error occurs, the application displays a message to help the user understand the problem.

12.Challenges and Solutions

One challenge was deploying the application across two separate web servers and ensuring that both servers served the same files.

This was addresses by deploying the same application files to Web01 and Web02.

Another challenge was configuring the load balancer.HAProxy was already using ports 80 and 443 on Lb01, so Nginx was not used as the load balancer.
HAProxy remained responsible for receiving and distributing traffic.

HTTPS access through the server IP also caused a certificate mismatch because the SSL certificate was issued for the domain name. Using the domain name resolved this issue.

13.Demo Video

Demo video link:[]

The video will demostrate the application locally and through the load balancer,including its main features and user interactions.

14.Security

This application does not require user accounts, passwords or API keys.

The .gitignore file is included in the repository to prevent unnecessary files and sensitive information from being committed.


15.Conclusion

This project demostrates how an application can retrieve useful information from an external REST API, present that information through an interactive web interface and be deployed across multiple servers.

It also demostrates how HAProxy can distribute incoming traffic between two web servers to improve availability and scalability.S