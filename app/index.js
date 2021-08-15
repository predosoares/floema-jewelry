import { each } from 'lodash'
import About from 'pages/about'
import Collections from 'pages/collections'
import Details from 'pages/details'
import Home from 'pages/home'

class App {
  constructor()
  {
    this.createContent()
    this.createPages()
    this.addLinkListeners()
  }

  createContent()
  {
    this.content = document.querySelector('.content')
    this.template = this.content.getAttribute('data-template')
    console.log(this.template)
  }

  createPages()
  {
    this.pages = {
      about: new About(),
      collections: new Collections(),
      detail: new Details(),
      home: new Home(),
    }

    this.page = this.pages[this.template]
    this.page.create()
    this.page.show()
  }

  async onChange(url)
  {
    this.page.hide()

    const request = await window.fetch(url)

    if (request.status === 200) {
      const html = await request.text()
      const div = document.createElement('div')

      div.innerHTML = html

      const divContent = div.querySelector('.content')
      const template = divContent.getAttribute('data-template')

      this.content.setAttribute('data-template', template)
      this.content.innerHTML = divContent.innerHTML

      this.page = this.pages[template]
      this.page.create()
      this.page.show()
    } else {
      console.log('Error')
    }
  }

  addLinkListeners ()
  {
    const links = document.querySelectorAll('a')

    each(links, link => {
      link.onclick = event => {
        event.preventDefault()

        const {  href  } = link

        this.onChange(href)
      }
    })
  }
}

new App()
