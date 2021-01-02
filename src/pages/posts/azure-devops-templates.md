---
title: "Azure DevOps Templates"
date: "2019-12-28"
---

I recently migrated a CI/CD pipeline from TeamCity and Octopus Deploy to Azure DevOps (AzDo) . We have a mostly micro-services architecture where almost all of the services were in one GitHub repository. I say "mostly" because we're near the finish line of using the [strangler pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/strangler) to gradually migrate away from the previous monolithic architecture.

My goals were:

- Each service has its own GitHub repository
- Every pull request is validated before merging to the master branch. For us this means:
  - It builds
  - All tests pass
  - PR title contains related JIRA issue key for tracking
- All changes in master and release branches are automatically built and deployed
- Minimal configuration needed for each service

I started out simply by adding an azure-pipelines.yml file that looked like this to each repository:

```yaml
name: 1.0$(Rev:.r)

trigger:
  - master
  - release-*

steps:
  - task: DotNetCoreCLI@2
    displayName: "Restore nugets"
    inputs:
      command: restore
      projects: "**/*.csproj"

  - task: DotNetCoreCLI@2
    displayName: "Run tests"
    inputs:
      command: "test"

  - task: DotNetCoreCLI@2
    condition: and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))
    displayName: "dotnet publish"
    inputs:
      command: publish
      publishWebProjects: false
      projects: "**/*.csproj"
      arguments: "--configuration Release --output $(Build.ArtifactStagingDirectory)"
      zipAfterPublish: true

  - task: PublishBuildArtifacts@1
    condition: and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))
```

This worked, but it didn't validate the PR name, and it is also is a lot of code duplication. The solution I chose for this was to use shared AzDo template yaml files.

Steps from a template can be included like this:

```yaml
steps:
  - template: build.yml
```

Since we have moved every service to its own repository, I created a separate repository named `devops-templates`. Templates from another repository can be referenced by adding this above where the template is referenced:

```yaml
resources:
  repositories:
    - repository: templates
      type: github
      name: yourOrgName/devops-templates
      endpoint: YourGitHubServiceConnection
```

We will also need to adjust where we use the template to include `@templates` after the template filename.

The azure-pipelines.yml file now looks like the code below. `GithubToken` is a secure AzDo variable that contains a [GitHub personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line).

```yaml
name: 1.0$(Rev:.r)

resources:
  repositories:
    - repository: templates
      type: github
      name: yourOrgName/devops-templates
      endpoint: YourGitHubServiceConnection

trigger:
  - master
  - release-*

steps:
  - template: build.yml@templates
    parameters:
      GithubToken: "$(GithubToken)"
```

The `build.yml` file in the `devops-templates` repository looks like this:

```yaml
parameters:
  GithubToken: ""
  runTests: true
  workingDirectory: ""

steps:
  - template: pr-validation.yml
    parameters:
      GithubToken: "${{ parameters.GithubToken }}"

  - task: DotNetCoreCLI@2
    displayName: "Restore nugets"
    inputs:
      command: "restore"
      projects: "**/*.csproj"

  - ${{ if eq(parameters.runTests, true) }}:
      - task: DotNetCoreCLI@2
        displayName: "Run tests"
        inputs:
          command: "test"
          workingDirectory: "${{ parameters.workingDirectory }}"

  - task: DotNetCoreCLI@2
    condition: and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))
    displayName: "dotnet publish"
    inputs:
      command: publish
      publishWebProjects: false
      projects: "**/*.csproj"
      arguments: "--configuration Release --output $(Build.ArtifactStagingDirectory)"
      zipAfterPublish: true

  - task: PublishBuildArtifacts@1
    condition: and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))
```

There is another template named `pr-validation.yml` that handles our PR title checks.

Line 78 has the regex for matching on the PR title. In this example it would match on any of the following text.

- AB-123456
- CD-134
- [skip-jira]

```yaml{numberLines: true}
parameters:
  GithubToken: ""

steps:
  - task: PowerShell@2
    inputs:
      targetType: "inline"
      script: |
        function Process-Failure {
            param(
                [PSCustomObject]
                $Data,
                [System.Text.RegularExpressions.MatchCollection]   
                $RegexMatches
            )

            $reason = "No JIRA issue detected."
            Write-Host $reason
            Write-Host "JIRA issue must be in title for pull request."
            Write-Host "##vso[task.logissue type=error;]$reason"
            Write-Host "##vso[task.complete result=Failed;]"
            Write-Error "FAILED FOR LACK OF JIRA ISSUE."
            Exit 1
        }

        function Process-Success {
            param(
                [PSCustomObject]
                $Data,
                [System.Text.RegularExpressions.MatchCollection]   
                $RegexMatches
            )

            Write-Host "Jira issues detected!"

            foreach ($match in $RegexMatches) {
                Write-Host $match.Value
            }
        }

        function Get-GitPullRequest {
            param($PullRequest, $GithubToken)

            $auth = "Bearer $GithubToken"
            $headers = @{
                'Authorization' = $auth
            }

            $repoUri = "$(System.PullRequest.SourceRepositoryURI)"
            $repoUri = $repoUri.replace(".git", "")
            $gitOrg = $repoUri.split("/")[-2]
            $gitRepo = $repoUri.split("/")[-1]
            $gitBaseUrl = "https://api.github.com/repos/" + $gitOrg + "/" + $gitRepo
            $pullRequestPath = "/pulls/"
            $url = $gitBaseUrl + $pullRequestPath + $PullRequest

            Write-Host "Attempting to get $PulRequest from $url"
            try {
                $pullRequestData = Invoke-RestMethod -Uri $url -Headers $headers
                Write-Host "Data successfully retrieved"
            } catch {
                $desc = $_.Exception.Response.StatusDescription
                $msg = "Error in web request - $desc"
                Write-Host "##vso[task.logissue type=error;]$msg"
                Write-Error $msg
                Write-Host "##vso[task.complete result=Failed;]"
                Exit 1
            }
            return $pullRequestData

        }

        function Process-PullRequestData {
            param($PullRequestData)
            
            $msg = $PullRequestData.title
            Write-Host "Parsing pull request title: $msg"
            $issueRegex = [regex] "((AB|CD)-\d{3,6})|(\[skip\-jira\])"
            $matches = $issueRegex.Matches($msg)
            If ($matches.Count -eq 0) {Process-Failure -Data $PullRequestData -RegexMatches $matches }
            ElseIF ($matches.Count -gt 0) {Process-Success -Data $PullRequestData -RegexMatches $matches}
        }


        function Parse-PullRequestForJiraTicket {
             param(
                [string]
                $PullRequest,
                [string]
                $GithubToken
            )

            $pullRequestData = Get-GitPullRequest -GithubToken $GithubToken -PullRequest $PullRequest
            Process-PullRequestData -PullRequestData $pullRequestData
        }

        Parse-PullRequestForJiraTicket -PullRequest $(System.PullRequest.PullRequestNumber) -GithubToken ${{ parameters.GithubToken }}
    displayName: "Check for JIRA issue in PR title"
    condition: and(succeeded(), eq(variables['Build.Reason'], 'PullRequest'))
```

With AzDo templates it makes it very simple to configure new services, but more importantly, it makes maintenance much easier.

<h3>Resources</h3>

- https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops
- https://confluence.atlassian.com/adminjiracloud/connect-jira-cloud-to-github-814188429.html
