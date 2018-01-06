import { h, Component } from 'preact';
import { authFetch, authPost } from "../../lib/js/fetch";
import { renderLoader } from "../../lib/js/loader_anim";
import format from "date-fns/format";


export class ScrapersPage extends Component {
  componentWillMount = () => {
    const extractScrapers = (data, status) => {
      return data.map(d => {
        d.status = status;
        d.start_time = new Date(Date.parse(d.start_time + " GMT"));
        d.end_time = new Date(Date.parse(d.end_time + " GMT"));

        return d;
      });
    }

    const filterLatest = scrapers => {
      let nameStartTimes = {};
      scrapers.forEach(s => {
        if (Object.keys(nameStartTimes).indexOf(s.spider) > -1){
          if (nameStartTimes[s.spider] < s.start_time){
            nameStartTimes[s.spider] = s.start_time;
          }
        }
        else{
          nameStartTimes[s.spider] = s.start_time;
        }
      });

      let result = [];
      Object.keys(nameStartTimes).forEach(name => {
        scrapers.forEach(scraper => {
          const date = scraper.start_time;
          if (scraper.spider === name && 
              date.toString() == nameStartTimes[name].toString()){
            result.push(scraper);
          }
        });
      });
      return result;
    }

    authFetch("/cms/scraper/list_spiders/").then(response => {
      response.json().then(json => {
        const spiders = json.spiders;

        authFetch("/cms/scraper/list/").then(response => {
          response.json().then(json => {
            let scrapers = [];
            scrapers = scrapers.concat(extractScrapers(json.finished, "finished"));
            scrapers = scrapers.concat(extractScrapers(json.pending, "pending"));
            scrapers = scrapers.concat(extractScrapers(json.running, "running"));
            scrapers = filterLatest(scrapers);

            // find missing spiders
            const scrapers_spiders = scrapers.map(s => s.spider);
            const missing = spiders.filter(s => scrapers_spiders.indexOf(s) === -1);
            missing.forEach(s => {
              scrapers.push({
                start_time: null,
                end_time: null,
                status: "inactive",
                id: "N/A",
                spider: s
              });
            });
            this.setState({ scrapers });

          });
        });
      });
    });
  }

  
  fullScraperDetails = spiderName => {
    const details = {
      sal: {
        name: "SAL Events",
        url: "https://www.sal.org.sg/Events/View-All-Events/Date-Desc"
      },
      calas: {
        name: "SILE CALAS",
        url: "https://www.silecpdcentre.sg/calas/",
      },
      lawsoc: {
        name: "LawSoc",
        url: "http://www.lawsoc.org.sg",
      },
      skillsfuture: {
        name: "SkillsFuture Training Directory",
        url: "https://www.myskillsfuture.sg/content/portal/en/training-exchange/course-directory.html"
      }
    };
    return details[spiderName];
  }


  render(){
    if (!this.state.scrapers){
      return renderLoader();
    }
    return(
      <div>
        <h1>Scrapers</h1>
        <p>All scrapers are hard-coded to run once a day at noon,
          Singapore time.</p>
        <p>To manually run a scraper, click on its Scrape button.</p>
        {this.state.scrapers.map(scraper => 
          <ScraperControl 
            scrapydData={scraper}
            spiderDetails={this.fullScraperDetails(scraper.spider)}
          />
        )}
      </div>
    );
  }
}


class ScraperControl extends Component {
  constructor(props){
    super(props);
    this.state = {
      isActive: true,
    };
  }


  handleScrapeButtonClick = () => {
    const spiderName = this.props.scrapydData.spider;
    const url = "/cms/scraper/run/";
    const data = {
      name: spiderName
    };

    authPost(url, data).then(response => {
      if (response.ok){
        this.setState({
          scrapeButtonClicked: true,
          scrapeError: false,
        });
      }
      else{
        this.setState({
          scrapeButtonClicked: true,
          scrapeError: true,
        });
      }
    });
  }


  render(){
    const t = this.props.scrapydData.start_time;
    const lastScrapeTime = t == null ? "N/A" : format(t, "ddd DD MMM YYYY, HH:mm:ss Z");

    return (
      <div class="scraper_control">
        <h2>{this.props.spiderDetails.name}</h2>

        <p>URL: <a target="_blank" href={this.props.spiderDetails.url}>
            {this.props.spiderDetails.url}
          </a>
        </p>

        <p>Status: {this.props.scrapydData.status}</p>
        <p>
          Most recent scrape at: {lastScrapeTime}
        </p>
        <p>ID: {this.props.scrapydData.id}</p>

        {(this.props.scrapydData.status !== "running") &&
            !this.state.scrapeButtonClicked &&
          <button onClick={this.handleScrapeButtonClick} class="pure-button button-green">
            <span>Scrape</span> 
          </button>
        }

        {this.state.scrapeButtonClicked && !this.state.scrapeError &&
          <p>Scrape in progress.</p>
        }

        {this.state.scrapeButtonClicked && this.state.scrapeError &&
          <p>Error launching the scrape.</p>
        }
      </div>
    );
  }
}
