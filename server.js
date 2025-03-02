const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;
require('dotenv').config();


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const base64 = require("base-64");
const { setTimeout } = require("timers/promises");

// Configuration
const githubToken = process.env.GITHUB_TOKEN;
const openAPIToken = process.env.OPEN_API_TOKEN;
// console.log(githubToken);

// Default values
const defaultBranchName = "SDG_MetaData";
const defaultCommitMessage = "Add SDG Medadata";
const defaultPrTitle = "SDG Metadata";
const defaultPrBody = "This pull request is to update repo with SDG Metadata for easier access and Searchability. Thank You for working with UN andf SDG";
const defaultFilePath = "code.json";
const forkedUsername = "Anket11";
// GitHub README proxy endpoint to avoid CORS issues
app.get('/api/fetch-readme', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    console.log('Fetching README from URL:', url);
    
    // Extract username and repo from GitHub URL
    // Format: https://github.com/username/repo
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(githubRegex);
    
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }
    
    const [, username, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, ''); // Remove .git extension if present
    
    // GitHub API URL for README content
    const apiUrl = `https://api.github.com/repos/${username}/${cleanRepo}/readme`;
    console.log('GitHub API URL:', apiUrl);
    
    // Fetch README metadata from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Add GitHub token if available to increase rate limit
        // 'Authorization': 'token YOUR_GITHUB_TOKEN'
      }
    });
    
    // Get the download URL for the README content
    const downloadUrl = response.data.download_url;
    console.log('README download URL:', downloadUrl);
    
    // Fetch the actual README content
    const contentResponse = await axios.get(downloadUrl);
    console.log('README content fetched successfully');
    
    res.json({ content: contentResponse.data });
  } catch (error) {
    console.error('Error fetching README:', error.message);
    // More detailed error logging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch README content', 
      message: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// API endpoint for AI analysis - stub for now
app.post('/api/analyze-readme', async (req, res) => {
  const { readmeText } = req.body;
  console.log(readmeText);
  
  if (!readmeText) {
    return res.status(400).json({ error: 'README text is required' });
  }
  
  console.log('Analyzing README text length:', readmeText.length);
  // If the README contains "MediAid", return the predefined response immediately
  // if (readmeText.toLowerCase().includes('mediaid')) {
  //   console.log("hehe")
  //   return res.json({
  //     "healthFocusAreas": [
  //       "Mental Health",
  //       "Healthcare Access",
  //       "Disease Prevention",
  //       "Emergency Response",
  //       "Medical Research"
  //     ],
  //     "sdg3Targets": [
  //       "3.3 End epidemics (AIDS, TB, malaria, etc.)",
  //       "3.4 Reduce non-communicable diseases",
  //       "3.5 Strengthen mental health services"
  //     ],
  //     "technologiesUsed": [
  //       "Web Application",
  //       "Mobile Application",
  //       "AI/ML Model",
  //       "Database System",
  //       "Data Visualization"
  //     ],
  //     "targetAudience": [
  //       "Healthcare Providers",
  //       "General Public",
  //       "Researchers",
  //       "Government Agencies"
  //     ],
  //     "isDeployed": true,
  //     "deploymentLocation": "USA, India, Europe"
  //   });
  // }

  try {
    // Prepare the prompt for ChatGPT
    const prompt = `
    You are an AI assistant tasked with analyzing open-source healthcare projects.
    
    Based on the following README text, determine which categories apply to this project.
    
    README TEXT:
    ${readmeText}
    
    Analyze the README and determine which options apply from the following categories.
    Return a JSON object with only the applicable options (include empty arrays if none apply):
    
    1. Health Focus Areas (select all that apply):
    - Mental Health
    - Healthcare Access
    - Disease Prevention 
    - Nutrition & Wellness
    - Emergency Response
    - Medical Research
    - Infectious Disease Control
    
    2. SDG3 Targets (select all that apply):
    - 3.1 Reduce maternal mortality
    - 3.2 End preventable newborn and child deaths
    - 3.3 End epidemics (AIDS, TB, malaria, etc.)
    - 3.4 Reduce non-communicable diseases
    - 3.5 Strengthen mental health services
    - 3.6 Reduce road traffic accident deaths
    - 3.9 Reduce exposure to hazardous chemicals and pollution
    
    3. Technologies Used (select all that apply):
    - Web Application
    - Mobile Application
    - AI/ML Model
    - Database System
    - Data Visualization
    - Biomedical Device
    
    4. Target Audience (select all that apply):
    - Healthcare Providers
    - General Public
    - Researchers
    - Government Agencies
    - Non-profits & NGOs
    
    5. Is the project currently in use (deployed)? Respond with true or false.
    
    6. If deployed, where is it being used? (provide a brief description or leave empty)
    
    Respond with ONLY a JSON object in the following format and nothing else:
    {
      "healthFocusAreas": [],
      "sdg3Targets": [],
      "technologiesUsed": [],
      "targetAudience": [],
      "isDeployed": false,
      "deploymentLocation": ""
    }
    `;

    // Call ChatGPT API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        "model": "gpt-3.5-turbo",
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      }
      ,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAPIToken}`
        }
      }
    );
    // console.log(response.data.choices[0].message.content.trim());
    // Extract the JSON response
    const aiResponseText = response.data.choices[0].message.content.trim();
    
    // Parse out just the JSON object from the response
    let jsonStart = aiResponseText.indexOf('{');
    let jsonEnd = aiResponseText.lastIndexOf('}') + 1;
    const jsonResponse = aiResponseText.substring(jsonStart, jsonEnd);
    
    // Parse the JSON response
    const analysis = JSON.parse(jsonResponse);
    
    // Ensure all required fields are present
    const completeAnalysis = {
      healthFocusAreas: analysis.healthFocusAreas || [],
      sdg3Targets: analysis.sdg3Targets || [],
      technologiesUsed: analysis.technologiesUsed || [],
      targetAudience: analysis.targetAudience || [],
      isDeployed: analysis.isDeployed || false,
      deploymentLocation: analysis.deploymentLocation || ""
    };
    
    console.log('AI Analysis results:', completeAnalysis);
    res.json(completeAnalysis);
    
  } catch (error) {
    console.error('Error analyzing README:', error);
    
    // Fallback to basic keyword analysis if AI analysis fails
    const fallbackAnalysis = performFallbackAnalysis(readmeText);
    
    console.log('Fallback analysis results:', fallbackAnalysis);
    return res.json(fallbackAnalysis);
  }
});

// Fallback function that uses basic keyword matching
function performFallbackAnalysis(readmeText) {
  const analysis = {
    healthFocusAreas: [],
    sdg3Targets: [],
    technologiesUsed: [],
    targetAudience: [],
    isDeployed: false,
    deploymentLocation: ""
  };
  
  const readme = readmeText.toLowerCase();
  
  // Health focus areas
  if (readme.includes('mental health') || readme.includes('psychology') || readme.includes('psychiatric'))
    analysis.healthFocusAreas.push('Mental Health');
  if (readme.includes('healthcare access') || readme.includes('medical access') || readme.includes('health equity'))
    analysis.healthFocusAreas.push('Healthcare Access');
  if (readme.includes('disease prevention') || readme.includes('prevent disease') || readme.includes('prophylaxis'))
    analysis.healthFocusAreas.push('Disease Prevention');
  if (readme.includes('nutrition') || readme.includes('wellness') || readme.includes('diet') || readme.includes('fitness'))
    analysis.healthFocusAreas.push('Nutrition & Wellness');
  if (readme.includes('emergency') || readme.includes('urgent care') || readme.includes('first aid') || readme.includes('disaster'))
    analysis.healthFocusAreas.push('Emergency Response');
  if (readme.includes('research') || readme.includes('medical study') || readme.includes('clinical trial'))
    analysis.healthFocusAreas.push('Medical Research');
  if (readme.includes('infectious') || readme.includes('virus') || readme.includes('bacterial') || readme.includes('pandemic') || readme.includes('epidemic'))
    analysis.healthFocusAreas.push('Infectious Disease Control');
  
  // SDG3 Targets
  if (readme.includes('maternal') || readme.includes('mother') || readme.includes('maternity') || readme.includes('pregnancy'))
    analysis.sdg3Targets.push('3.1 Reduce maternal mortality');
  if (readme.includes('newborn') || readme.includes('infant') || readme.includes('child mortality') || readme.includes('pediatric'))
    analysis.sdg3Targets.push('3.2 End preventable newborn and child deaths');
  if (readme.includes('aids') || readme.includes('hiv') || readme.includes('tuberculosis') || readme.includes('tb') || readme.includes('malaria') || readme.includes('epidemic'))
    analysis.sdg3Targets.push('3.3 End epidemics (AIDS, TB, malaria, etc.)');
  if (readme.includes('non-communicable') || readme.includes('chronic disease') || readme.includes('diabetes') || readme.includes('cancer') || readme.includes('cardiovascular'))
    analysis.sdg3Targets.push('3.4 Reduce non-communicable diseases');
  if (readme.includes('mental health service') || readme.includes('psychiatric care') || readme.includes('psychological support'))
    analysis.sdg3Targets.push('3.5 Strengthen mental health services');
  if (readme.includes('road') || readme.includes('traffic') || readme.includes('accident') || readme.includes('vehicle safety'))
    analysis.sdg3Targets.push('3.6 Reduce road traffic accident deaths');
  if (readme.includes('chemical') || readme.includes('pollution') || readme.includes('toxic') || readme.includes('contamination') || readme.includes('environmental health'))
    analysis.sdg3Targets.push('3.9 Reduce exposure to hazardous chemicals and pollution');
  
  // Technologies detection
  if (readme.includes('web') || readme.includes('website') || readme.includes('html') || readme.includes('javascript') || readme.includes('react') || readme.includes('angular'))
    analysis.technologiesUsed.push('Web Application');
  if (readme.includes('mobile') || readme.includes('android') || readme.includes('ios') || readme.includes('app store') || readme.includes('smartphone'))
    analysis.technologiesUsed.push('Mobile Application');
  if (readme.includes('ai') || readme.includes('machine learning') || readme.includes('neural') || readme.includes('deep learning') || readme.includes('algorithm'))
    analysis.technologiesUsed.push('AI/ML Model');
  if (readme.includes('database') || readme.includes('sql') || readme.includes('nosql') || readme.includes('data storage') || readme.includes('mongodb'))
    analysis.technologiesUsed.push('Database System');
  if (readme.includes('visualization') || readme.includes('chart') || readme.includes('graph') || readme.includes('dashboard') || readme.includes('display'))
    analysis.technologiesUsed.push('Data Visualization');
  if (readme.includes('device') || readme.includes('hardware') || readme.includes('medical equipment') || readme.includes('sensor') || readme.includes('biomedical'))
    analysis.technologiesUsed.push('Biomedical Device');
  
  // Target audience
  if (readme.includes('doctor') || readme.includes('nurse') || readme.includes('clinician') || readme.includes('provider') || readme.includes('hospital staff'))
    analysis.targetAudience.push('Healthcare Providers');
  if (readme.includes('public') || readme.includes('patient') || readme.includes('user') || readme.includes('consumer') || readme.includes('everyone'))
    analysis.targetAudience.push('General Public');
  if (readme.includes('research') || readme.includes('scientist') || readme.includes('study') || readme.includes('academic'))
    analysis.targetAudience.push('Researchers');
  if (readme.includes('government') || readme.includes('policy') || readme.includes('regulation') || readme.includes('agency'))
    analysis.targetAudience.push('Government Agencies');
  if (readme.includes('non-profit') || readme.includes('ngo') || readme.includes('foundation') || readme.includes('charity') || readme.includes('humanitarian'))
    analysis.targetAudience.push('Non-profits & NGOs');
  
  // Deployment
  if (readme.includes('deployed') || readme.includes('live') || readme.includes('production') || readme.includes('launched') || readme.includes('active')) {
    analysis.isDeployed = true;
    
    // Extract deployment location
    const locationKeywords = [
      'hospital', 'clinic', 'university', 'research center', 'lab', 
      'community', 'field', 'region', 'country', 'global',
      'healthcare setting', 'medical facility'
    ];
    
    for (const keyword of locationKeywords) {
      if (readme.includes(keyword)) {
        analysis.deploymentLocation = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }
  }
  
  return analysis;
} 


function getTargetRepoFromUrl(url) {
  // Extract the repository's username and name from the URL
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);

  if (match) {
      const username = match[1];
      const repoName = match[2];
      return `${username}/${repoName}`;
  } else {
      throw new Error("Invalid GitHub URL format");
  }
}
function generateGitHubLinks(originalUrl, forkedUsername, branchName) {
  // Extract owner and repo name from the original GitHub URL
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = originalUrl.match(regex);

  if (!match) {
      throw new Error("Invalid GitHub URL format");
  }

  const originalOwner = match[1];
  const repoName = match[2];

  // Generate the required links
  const forkedRepoBranchLink = `https://github.com/${forkedUsername}/${repoName}/tree/${branchName}`;
  const comparePrLink = `https://github.com/${originalOwner}/${repoName}/compare/main...${forkedUsername}:${repoName}:${branchName}`;

  return {
      forkedRepoBranchLink,
      comparePrLink
  };
}
app.post("/api/create-pr", async (req, res) => {
  const { url, jsonData } = req.body;
  console.log(req.body);
  if (!url) {
      return res.status(400).json({ error: "Repository URL is required" });
  }
  if (!jsonData) {
      return res.status(400).json({ error: "JSON data is required" });
  }

  const targetRepo = getTargetRepoFromUrl(url);
  const branchName = req.body.branchName || defaultBranchName;
  const commitMessage = req.body.commitMessage || defaultCommitMessage;
  const filePath = req.body.filePath || defaultFilePath;
  console.log(githubToken);
  const headers = {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json"
  };

  try {
      // 1. Fork the repository
      const forkResponse = await axios.post(`https://api.github.com/repos/${targetRepo}/forks`, {}, { headers });
      const forkData = forkResponse.data;
      const forkedUsername = forkData.owner.login; // Get the username of the forked repo
      console.log(`Successfully forked repository to ${forkData.full_name}`);

      // Wait for fork to be ready
      await setTimeout(5000);

      // 2. Get default branch reference
      const refResponse = await axios.get(`https://api.github.com/repos/${forkData.full_name}/git/refs/heads`, { headers });
      const refs = refResponse.data;
      const defaultBranchSHA = refs[0]?.object?.sha;
      if (!defaultBranchSHA) throw new Error("Could not find default branch reference");

      // 3. Create a new branch
      await axios.post(`https://api.github.com/repos/${forkData.full_name}/git/refs`, {
          ref: `refs/heads/${branchName}`,
          sha: defaultBranchSHA
      }, { headers });
      console.log(`Successfully created branch ${branchName}`);

      // 4. Create the new JSON file
      const jsonContent = JSON.stringify(jsonData, null, 2);
      await axios.put(`https://api.github.com/repos/${forkData.full_name}/contents/${filePath}`, {
          message: commitMessage,
          content: base64.encode(jsonContent),
          branch: branchName
      }, { headers });
      console.log(`Successfully created file ${filePath}`);

      // Generate PR links dynamically
      const links = generateGitHubLinks(url, forkedUsername, branchName);
      console.log(links);

      // Return the generated links in the API response
      return res.json({
          message: "Repository forked, branch created, and file added successfully",
          links
      });
  } catch (error) {
      console.error(error.response?.data?.message || error.message);
      res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// Function to extract targetRepo from URL
function getTargetRepoFromUrl(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error("Invalid GitHub URL format");
  return `${match[1]}/${match[2]}`;
}

// Function to generate GitHub links
function generateGitHubLinks(originalUrl, forkedUsername, branchName) {
  const match = originalUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error("Invalid GitHub URL format");

  const originalOwner = match[1];
  const repoName = match[2];

  return {
      forkedRepoBranchLink: `https://github.com/${forkedUsername}/${repoName}/tree/${branchName}`,
      comparePrLink: `https://github.com/${originalOwner}/${repoName}/compare/main...${forkedUsername}:${repoName}:${branchName}`
  };
}

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});