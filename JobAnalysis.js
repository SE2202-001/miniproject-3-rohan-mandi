class Job { // Job class to store job details from JSON file
    constructor(title, posted, type, level, skill, detail){ // Constructor to initialize job details, only the nessesary ones
        this.title = title;
        this.posted = posted;
        this.type = type;
        this.level = level;
        this.skill = skill;
        this.detail = detail;
    }

    // Get job details as a String, used for displaying the details of a job when clicked
    getDetails(){
        return `Title: ${this.title}\nType: ${this.type}\nLevel: ${this.level}\nSkill: ${this.skill}\nDescription: ${this.detail}\nPosted: ${this.posted}`;
    }

    // Converts all posted time to a standardized unit within the code (minutes). Does not change the displayed time, just used for sorting by time
    getFormattedPostedTime(){
        if (this.posted.includes("minute")) {
            return parseInt(this.posted) || 0;
        } else if (this.posted.includes("hour")) {
            return parseInt(this.posted) * 60 || 0; // Convert hours to minutes
        } else if (this.posted.includes("day")) {
            return parseInt(this.posted) * 1440 || 0; // Convert days to minutes (days are not given in the JSON file, but included for alternative use)
        } 
        return Infinity; // If time is not given, assumed to be largest value possible meaning it will be the oldest posting by default
    }
}

let jobsList = []; // Arrays for the job listings

// Event listener to see if user uploaded a file
document.getElementById('upload').addEventListener('change', function(event) {
    // Get the uploaded file
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader(); // Create a new file reader
        reader.onload = function(event) { // Event listener for when file is loaded
            try {
                // Parse JSON data from the file into data constant
                const data = JSON.parse(event.target.result); 
                jobsList = data.map(job => new Job(job.Title, job.Posted, job.Type, job.Level, job.Skill, job.Detail)); // Map the data into an Array of Job objects called JobsList
                // Show filter and sorting options, as well as the click to view job description heading
                document.getElementById('filters').style.display = 'block';
                document.getElementById('jobClick').style.display = 'block';
                document.getElementById('sortingBox').style.display = 'block';
                document.getElementById('box').style.display = 'block';
                populateFilters();
                displayJobs(jobsList);
            } catch (error) {
                alert('Invalid file used, please upload a valid JSON file'); // If the file is not a valid JSON file, alert the user, error checking
            }
        };
        reader.readAsText(file); 
    }
});

// Populate filter dropdowns with given values from the JSON file from the jobs using Set (removes duplicates)
function populateFilters() {
    const levels = new Set(jobsList.map(job => job.level));
    const types = new Set(jobsList.map(job => job.type));
    const skills = new Set(jobsList.map(job => job.skill));

    dropdownGen(document.getElementById('level'), levels);
    dropdownGen(document.getElementById('type'), types);
    dropdownGen(document.getElementById('skill'), skills);
}

// Event listeners to see if the user changed the filter options
document.getElementById('level').addEventListener('change', filterJobs);
document.getElementById('type').addEventListener('change', filterJobs);
document.getElementById('skill').addEventListener('change', filterJobs);

// Filter jobs based on selected criteria
function filterJobs() {
    const level = document.getElementById('level').value;
    const type = document.getElementById('type').value;
    const skill = document.getElementById('skill').value;

    const filteredJobs = jobsList.filter(job => { // Returns the jobs that match the selected criteria
        return (!level || job.level === level) &&
            (!type || job.type === type) &&
            (!skill || job.skill === skill);
    });
    displayJobs(filteredJobs); // Display the filtered jobs
}

// Generate dropdown options
function dropdownGen(dropdown, values){
    dropdown.innerHTML = '<option value="">All</option>'; // Default option for dropdowns
    values.forEach(value => {
        dropdown.innerHTML += `<option value="${value}">${value}</option>`; // Add each given value to the dropdown
    });
}

// Display jobs on the page based on the given list
function displayJobs(jobsList) {
    const jobs = document.getElementById('jobs'); // Get the jobs div
    jobs.innerHTML = ''; // Clear the jobs div
    if (jobsList.length === 0) { // If no jobs meet the criteria, display an error message
        jobs.innerHTML = '<p>Error! No jobs found, try different filters.</p>';
        return;
    }
    jobsList.forEach((job, index) => { // For each job in the list, display the job details
        const jobDiv = document.createElement('div');
        jobDiv.id = `jobListing-${index}`;
        jobDiv.innerHTML = `<p>${job.title} - ${job.type} (${job.level}) - Posted: ${job.posted}</p><hr>`;
        jobDiv.addEventListener('click', function() {   // Event listener for when a job is clicked, displays the job details
            alert(job.getDetails()); 
        });
        jobs.appendChild(jobDiv); // Add the job to the jobs div
    });
}

// Event listener for sorting jobs
document.getElementById('sort').addEventListener('change', function() { // Event listener for when the sorting option is changed
    const sorting = document.getElementById('sort').value; // Get the selected sorting option value
    if(sorting === 'az'){ 
        jobsList.sort((a, b) => a.title.localeCompare(b.title)); // Sort the jobs alphabetically by title (A-Z) using the sort function and localeCompare to compare strings alphabetically
    } else if(sorting === 'za'){
        jobsList.sort((a, b) => b.title.localeCompare(a.title)); // Sort the jobs alphabetically by title (Z-A) using the sort function and localeCompare to compare strings alphabetically
    } else if(sorting === 'latest'){
        jobsList.sort((a, b) => a.getFormattedPostedTime() - b.getFormattedPostedTime()); // Sort the jobs by the time posted (latest first) using the getFormattedPostedTime function to convert all times to minutes and compare them with the sort function
    } else if(sorting === 'oldest'){
        jobsList.sort((a, b) => b.getFormattedPostedTime() - a.getFormattedPostedTime()); // Sort the jobs by the time posted (oldest first) using the getFormattedPostedTime function to convert all times to minutes and compare them with the sort function
    }
    displayJobs(jobsList); // Display the sorted jobs
});