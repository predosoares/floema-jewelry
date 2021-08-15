require('dotenv').config()

const logger = require('morgan')
const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path')

const app = express()
const PORT = 3000

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: req
  });
}

const handleLinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  } else if (doc.type === 'about') {
    return '/about'
  } else if (doc.type === 'collections' || doc === 'Collection') {
    return '/collections'
  }

  return '/'
}


app.use((req, res, next) => {
  res.locals.Link = handleLinkResolver

  res.locals.PrismicDOM = PrismicDOM
  res.locals.ParseToNumbers = index => {
    return index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : ''
  }

  next();
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')


const handleRequest = async api => {
  const meta = await api.getSingle('metadata')
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')

  return {
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('h')
  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })


  res.render('pages/home', {
    ...defaults,
    collections,
    home
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const about = await api.getSingle('about')
  const defaults = await handleRequest(api)

  res.render('pages/about', {
    ...defaults,
    about
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('h')
  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })

  // collections[0].data.products.forEach(product => {
  //   console.log(product.products_product)
  // })

  res.render('pages/collections', {
    ...defaults,
    collections,
    home
  })
})

app.get('/detail/:uid', async (req, res) => {
  const uid = req.params.uid

  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', uid, {
    fetchLinks: 'collection.title'
  })


  res.render('pages/detail', {
    ...defaults,
    product,
  })
})


app.listen(PORT,  () => {
  console.log(`App listening to port ${PORT} 🚀`)
})
