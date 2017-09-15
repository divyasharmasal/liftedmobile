import { h, Component } from 'preact';

export class ScrapersPage extends Component {
  render(){
    return(
      <div>
        <h1>Scrapers</h1>
        <ScraperControl title="SAL" />
        <ScraperControl title="CALAS" />
        <ScraperControl title="SkillsFuture" />
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


  toggleActive = () => {
    this.setState({
      isActive: !this.state.isActive,
    });
  }


  render(){
    return (
      <div class="scraper_control">
        <h2>{this.props.title}</h2>
        <p>
          <span class="label">Status: </span> {this.state.isActive ? 
              <span>running</span> :
              <span>paused</span>
          }
        </p>
        <p>
          <span class="label">
            Most recent scrape: </span> <span>{(new Date()).toString()}</span>
        </p>

        {this.state.isActive ?
          <button onClick={this.toggleActive} class="pure-button pause_button">
            <span>pause</span> 
          </button>
          :
          <button onClick={this.toggleActive} class="pure-button start_button">
            <span>start</span> 
          </button>
        }
      </div>
    );
  }
}
