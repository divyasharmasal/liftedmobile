import { h, Component } from 'preact';

export class Nav extends Component {
  render(){
    return(
      <div class="nav">
        <a href="/cms/">Home</a>
        <a href="/cms/courses/">Courses</a>
        <a href="/cms/courses/scraping/">Scraping</a>
      </div>
    )
  }
}
