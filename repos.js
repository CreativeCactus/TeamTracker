var GitHubApi = require("github");
const AUTH = {
    githubUser: process.env.GITHUB_USER||console.error('no github user!'),
    githubToken: process.env.GITHUB_TOKEN||console.error('no github token!')
}

module.exports = class RepoGroup {
    constructor(...urls){
        this.repos=urls.map(url=>URLToRepo(url))
        this.updateAll();
    }

    update(){
        this.repos.forEach(this.updateOne)
    }
    updateOne(repo){
        repo.update()
    }
}

function URLToRepo(url){
    // Only support github at this time...
    repo=url.split('/') // Should be like CreativeCactus/TeamTracker
    return new GitRepo({owner:repo[0], repo:repo[1]})
}

class Repo {}
class GitRepo extends Repo {
    constructor(repoPath){
        super()
        this.api = new GitHubApi({})
        this.owner = repoPath.owner
        this.repo = repoPath.repo
        this.api.authenticate({
            type: "basic",
            username: AUTH.githubUser, 
            password: AUTH.githubToken
        })
    }
    update(){
        console.log('TODO: see most recent commit in local history and only get since')
        this.api.repos.getCommits({
            owner: this.owner,
            repo: this.repos
        }).then(reponse=>{
            // Now with the list of commits...
            if(response.meta.status!=='200 OK'){
                return console.error('Bad status from getCommits:'+response.meta.status)
            }

            // Promise to have each commit's details
            Promise.all(...response.data.map(e=>{
                return new Promise((a,r)=>{
                    this.api.repos.getCommit({
                        owner: this.owner,
                        repo: this.repos,
                        sha: e.sha
                    }).then(res=>{
                        if(response.meta.status!=='200 OK'){
                            console.error('Bad status from getCommits:'+response.meta.status)
                            r(res);
                        }
                        a(res);
                    })
                })
            })).then(commits=>{
                //Now with each commit's details...

                // Add new commits, ensuring no dupes
                this.commits = this.commits.append(
                    this.reponse.data.map(c=>{
                        if(this.shas.indexOf(c.data.sha)>=0) return null;
                        return new GithubCommit(c.data)
                    })
                )

                // Add the shas to an ordered array, most recent last (hopefully)
                this.shas = uniq(
                    this.shas.concat(
                        commits.map(c=>c.data.sha)
                    )
                )
                    
            })
        })
    }

}
class Commit{}
class GithubCommit extends Commit {
    constructor(data){
        this.data=data
        this.sha=data.sha
    }
    get diaryList(){
        const regex=(/^\w*\.diary\.md$/i)
        return this.data.files.
            map(file=>regex.exec(file.filename)).
            filter(match=>match).
            map(match=>match[0])
    }
}
function uniq (array){ return [...new Set(array)]; }
//cb(res, data, err)
function GET(host,path,data,auth,cb){
    // const postData = querystring.stringify(data);
        
    const options = {
        hostname: host,
        port: 80,
        path,
        auth: auth,
        method: 'GET',
        headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            // 'Content-Length': Buffer.byteLength(postData)
        }
    };
        
    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => cb(res,rawData) );
    });
        
    req.on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        cb(null,null,e)
    });
        
    // write data to request body
    // req.write(postData);
    // req.end();
}