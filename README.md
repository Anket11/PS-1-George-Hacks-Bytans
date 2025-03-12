# **WellNest - Health & Well-Being Open Source Discovery**  

## **Overview**  
The **Health & Well-Being Open Source Discovery** project helps open-source maintainers and contributors align their projects with the **United Nations' Sustainable Development Goals (SDGs)**, specifically **SDG 3: Good Health and Well-Being**.  

With over **300 million open-source projects on GitHub**, many contribute to global health and well-being, but **there is no standardized method to identify or measure their impact**. This project provides a structured workflow to help maintainers classify their projects and generate machine-readable metadata to improve **discovery, funding, and collaboration**.  

---

## **Problem Statement**  
Developed in collaboration with the **GW Open Source Program Office (OSPO)** and the **United Nations**, this initiative aims to create a seamless workflow that allows open-source projects to:  

- Identify their alignment with **SDG 3** (Good Health and Well-Being).  
- Generate standardized metadata files (`code.json`, `yaml`, `markdown`).  
- Automate contributions to project repositories.  
- Improve discoverability through a centralized **searchable dashboard**.  

---

## **Features & Workflow**  

### **Phase 1: Metadata Extraction**  
- Users provide a **GitHub repository link**.  
- An **LLM-based parser** extracts project information from the `README.md`.  
- If missing data exists, the user answers simple **guided questions**.  

### **Phase 2: Code Metadata Generation**  
- The system generates a `code.json` file containing **structured project metadata**.  
- This metadata follows standardized formats to ensure compatibility with **funding agencies, researchers, and contributors**.  

### **Phase 3: Automated Contribution**  
- A **Pull Request (PR)** is automatically generated to add the `code.json` file to the repository.  
- Maintainers can review, approve, or modify the metadata before merging.  
- If PRs are not accepted, users can **manually download the metadata**.  

### **Phase 4: Project Discovery Dashboard**  
- A **searchable, filterable dashboard** is created to list categorized projects.  
- Users can explore projects by **impact area, programming language, contributor base, and funding potential**.  
- The dashboard enables funders, developers, and organizations to **find and support impactful projects**.  

---

## **Technical Stack**  
- **Backend**:  Node.js  
- **Frontend**: HTML
- **LLM Integration**: OpenAI
- **GitHub Integration**: GitHub API for repository analysis and PR creation  

---

## **Getting Started**  

### **Prerequisites**  
- Node.js  
- GitHub API Token (for PR automation)  
- OpenAI API Key (for LLM-based README parsing)  

### **Installation**  
1. Clone the repository:  
   ```bash
   git clone https://github.com/Anket11/PS-1-George-Hacks-Bytans
   cd PS-1-George-Hacks-Bytans
   ```
2. Install dependencies:  
   ```
   npm install  # If using a Node.js frontend
   ```
3. Set up environment variables in env:  
   ```bash
   export GITHUB_API_KEY=your_api_key_here
   export OPENAI_API_KEY=your_openai_key_here
   ```
4. Run the application:  
   ```
   npm server.js  # If running a React frontend
   ```

---

## **How to Contribute**  
1. Fork the repository.  
2. Create a new branch (`feature-xyz`).  
3. Make your changes and commit.  
4. Submit a pull request (PR) for review.  

---

## **License**  
This project is licensed under the **MIT License**.  

---

## **Contact**  
For questions or collaborations, reach out via:  
- **Email**: your-email@example.com  
- **GitHub Issues**: [Open an Issue](https://github.com/your-org/health-os-discovery/issues)  

---

**Contributions are welcome! Help us make open-source health projects more discoverable and impactful! 🚀**  

---

This README follows best practices for documentation, making it easy for developers, contributors, and funders to engage with your project. Let me know if you'd like any modifications! 🚀
