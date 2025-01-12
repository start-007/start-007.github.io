
var headers = {
    "Accept": "application/vnd.github+json", 
    "Authorization": `Bearer ${token}`,    
    "X-GitHub-Api-Version": "2022-11-28"  
};
var owner="start-007"
var repo="Movies"
var path="test.txt"
var token=""
var url= `https://api.github.com/repos/${owner}/${repo}/contents/${path}`


async function commitWatchedToGithub() {
    const movieName=document.getElementById("watched-movie").value
    if(!window.confirm("Are you sure, you want to commit watched movie: '"+movieName+"'"))
        return
    let response=await fetchGithubFileContents()
    let decodedString=response.decodedString
    const endsWithNewline = decodedString.endsWith('\n');

// If the string doesn't end with a newline, add one
    decodedString = endsWithNewline ? decodedString : decodedString + '\n';
    let numbers = decodedString.match(/\d+(?=\.)/g);
    let lastNumber = numbers[numbers.length - 1];
    
    decodedString+=(Number(lastNumber)+1)+". "+movieName
    
    const encodedString = encodeToBase64(decodedString);

    let sha=response.sha
    const msg=await commitToGithub(encodedString,sha,movieName)
    if(msg){
        alert("Successfully commited the movie")
    }
    else{
        alert("Failed")
    }
    
}   

async function commitToGithub(encodedString,sha,movieName) {
    
    const dataToCommit={
        "message": `Commiting Watched Movie (${path}): ${movieName}`,
        "committer": {
          "name": "System bot",
          "email": "systembot@teja.com"
        },
        "content": encodedString,
        "sha": sha
    }
    try {
        const response = await fetch(url, { method: "PUT", headers: headers, body: JSON.stringify(dataToCommit)});
        if (!response.ok) {
            return false
        }
        return true
    } catch (error) {
        document.getElementById("decoded-output").textContent = 'Failed '+error
        return false;
    }
}

async function fetchGithubFileContents() { 

    try {
        const response = await fetch(url, { method: "GET", headers: headers });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data.content) {
            const decodeString=decodeBase64FromInput(data.content)
            return {
                'decodedString': decodeString,
                'sha': data.sha,
            };
        } else {
            throw new Error('No content found');
        }
    } catch (error) {
        document.getElementById("decoded-output").textContent = 'Failed '+error
        return null;
    }
}


function decodeBase64FromInput(encodedString) {
    
    const base64String = encodedString
    const decodedString = decodeBase64(base64String);

    if (decodedString) {
        return decodedString;
    } else {
        throw new Error('Error decoding Base64.');
    }
}

// Function to decode the Base64 string to UTF-8
function decodeBase64(base64String) {
    try {
        let decodedData = atob(base64String);

        let decodedText = decodeURIComponent(escape(decodedData));
        
        return decodedText;
    } catch (e) {
        console.error("Error decoding Base64:", e);
        return null;
    }
}

function encodeToBase64(inputString) {
    // Use the built-in btoa function to encode the string to Base64
    const base64String = btoa(inputString);
    return base64String;
  }
  