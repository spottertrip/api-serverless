const fs = require('fs')
const { JSDOM } = require('jsdom')
const { v4 } = require('uuid')

const categories = [
  {
    categoryId: '9018066d-88b9-4906-a6db-7f9e46e0783b',
    name: 'culture',
    thumbnailUrl: 'https://www.sortiraparis.com/images/55/83517/421563-visuel-paris-musee-du-louvre-3.jpg',
    link: 'https://www.tripadvisor.fr/Attraction_Products-g187791-zfc11889-zfg11867-Rome_Lazio.html'
  },
  {
    categoryId: '96775713-f67a-4a3b-aac3-62711da6699a',
    name: 'party',
    thumbnailUrl: 'https://blogmedia.evbstatic.com/wp-content/uploads/wpmulti/sites/8/shutterstock_199419065.jpg',
    link: 'https://www.tripadvisor.fr/Attraction_Products-g187791-zfc11890-zfg11868-Rome_Lazio.html'
  },
  {
    categoryId: '4f5848f0-cf7e-4c68-984a-f3202455281e',
    name: 'exploration',
    thumbnailUrl: 'https://soulspartan.files.wordpress.com/2017/02/nature-2-26-17.jpg',
    link: 'https://www.tripadvisor.fr/Attractions-g187791-Activities-c57-Rome_Lazio.html'
  },
  {
    categoryId: '9484a3404-3422-416a-8dc7-95565ce2f054',
    name: 'sport',
    thumbnailUrl: 'https://www.commeuncamion.com/content/uploads/2017/10/quelle-tenue-pour-quel-sport.jpg',
    link: 'https://www.tripadvisor.fr/Attraction_Products-g187791-zfc11911-zfg11876-Rome_Lazio.html'
  },
]

const tripAdvisorUrl = 'https://www.tripadvisor.fr'
const globalLocation = {
  city: 'Rome',
  country: 'Italy',
  postalCode: '00100',
  street: 'Rome, Italy',
}

const globalActivities = []

const buildUrl = (link) => {
  return `${tripAdvisorUrl}${link}`
}

const main = async () => {
  const promises = categories.map(async (c) => {
    await parseCategoriesPage(c)
  })
  await Promise.all(promises)

  const finalCategories = categories.map(c => {
    const fC = {...c}
    delete c.link
    return c
  })
  console.log('Writing files...')
  fs.writeFileSync('categories.json', JSON.stringify(finalCategories), 'UTF8')
  fs.writeFileSync('activities.json', JSON.stringify(globalActivities), 'UTF8')
  console.log('all done')
}

const parseCategoriesPage = async (category) => {
  const dom = await JSDOM.fromURL(category.link, {
    runScripts: 'dangerously'
  })

  const { document } = dom.window
  const activities = document.querySelectorAll('.attraction_element')

  const promises = []
  activities.forEach((activity) => {
    const title = activity.querySelector('.listing_title a')
    const pageRegex = new RegExp('\/AttractionProductDetail-([a-zA-Z0-9-_]+).html')
    const activityLink = `${title.onclick}`.match(pageRegex)

    if (activityLink && activityLink.length > 0) {
      promises.push(parseActivityPage(activityLink[0], category))
    }
  })

  return Promise.all(promises)
}


const parseActivityPage = async (link, category) => {
  const finalLink = buildUrl(link)
  const { window: { document } } = await JSDOM.fromURL(finalLink, {})

  // TITLE
  const activityTitle = document.querySelector('.h1').textContent
  // PRICE
  const price = document.querySelector('.attractions-price-block-FromPriceBlock__mainPrice--2XwLZ span').textContent
  price.replace(',', '.')
  price.replace('€', '')
  // DESCRIPTION
  const descriptions = document.querySelectorAll('.common-text-ReadMore__readMore--3Iu8c')
  const description = descriptions[1].querySelector('span').textContent
  // // durée 
  const durationDOM = document.querySelector('#DETAILS')
  const durationRegex = new RegExp(': ([0-9,.]+)')
  const duration = durationDOM.textContent.match(durationRegex)[1]

  const languagesRegex = new RegExp('proposées: ([a-zç, ]+)')
  const languageMatch = durationDOM.textContent.match(languagesRegex)
  const languageString = languageMatch && languageMatch[1] || 'anglais'
  const languages = languageString.split(', ')


  // Location
  const locationRegex = new RegExp('"coords":"([0-9\.]+),([0-9\.]+)"')
  const latLng = document.body.textContent.match(locationRegex)
  const location = {
    ...globalLocation,
    latitude: parseFloat(latLng[1], 7),
    longitude: parseFloat(latLng[2], 7),
  }

  // pictures
  const picturesDOM = document.querySelectorAll('.media-media-carousel-MediaCarousel__imageGallerySlide--3HC1k img')
  const pictures = []
  for (let i = 0; i < picturesDOM.length; i++) {
    const pictureDOM = picturesDOM[i];
    pictures.push(pictureDOM.src)
  }

  // office
  const officeA = document.querySelector('.attractions-product-info-SupplierLink__link--1vA1h')
  if (!officeA || !officeA.href) return
  const office = await parseOfficePage(officeA.href)

  const activity = {
    description,
    location,
    pictures,
    office,
    languages,
    activityId: v4(),
    duration: parseFloat(duration, 0),
    price: parseFloat(price, 0),
    name: activityTitle,
    category: {
      categoryId: category.categoryId,
      name: category.name,
    },
  }
  globalActivities.push(activity);
}

const parseOfficePage = async (link) => {
  const { window: { document } } = await JSDOM.fromURL(link, {})

  const name = document.querySelector('#HEADING').textContent
  const aboutDOM = document.querySelector('.attractions-supplier-profile-SupplierCategories__headerDetail--2Fk4B')
  const about = aboutDOM && aboutDOM.textContent || `${name} n'a pas partagé de description.`
  const pictureRegex = new RegExp('"images":{"small":{"url":"([a-zA-Z0-9-_\.\/\:]+)"')
  const thumbnailUrl = document.body.textContent.match(pictureRegex)
  return {
    name,
    about,
    thumbnailUrl: thumbnailUrl[1],
    officeId: v4(),
  }
}

main()
  .then(() => console.log('finished'))