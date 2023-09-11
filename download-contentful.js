const Promise = require('bluebird')
const contentful = require('contentful')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
})

async function getEntryItems (contentType, skip = 0) {
  const resp = await client.getEntries({
    content_type: contentType,
    order: 'sys.createdAt',
    include: 2,
    skip
  })

  let items = resp.items

  if (resp.skip + resp.limit < resp.total) {
    const nextItems = await getEntryItems(contentType, skip + resp.limit)
    items = items.concat(nextItems)
  }

  return items
}

function convertEntryItemsToPosts (entry) {
  const fields = entry.fields ?? {}

  const title = fields.title
  const description = fields.description
  const slug = fields.slug
  const date = fields.date
  let body = fields.body

  const images = body.match(/\/\/(assets|images).ctfassets.net\/.+\/.+\/.+\/.+\.(heic|png|jpeg|jpg|webp)/ig)
  const replacedImages = []
  for (const image of images) {
    const url = image.match(/\/\/(assets|images).ctfassets.net\/(.+)\/(.+)\/(.+)\/(.+)\.(heic|png|jpeg|jpg|webp)/i)

    const imageUrl = `https://images.ctfassets.net/${url[2]}/${url[3]}/${url[4]}/${url[5]}.${url[6]}?fm=webp&w=1600`
    const folder = `/images/${slug}`
    const filename = `${url[5]}.webp`

    body = body.replace(image, `${folder}/${filename}`)

    replacedImages.push({
      url: imageUrl,
      folder,
      filename
    })
  }

  return {
    title,
    description,
    slug,
    date,
    body,
    images: replacedImages
  }
}

async function fileExists (path) {
  return fs.promises.access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

async function downloadImage (image) {
  const folder = path.join(__dirname, image.folder)
  const imagePath = path.join(__dirname, `${image.folder}/${image.filename}`)

  if (await fileExists(imagePath)) {
    return
  }

  await fs.promises.mkdir(path.join(__dirname, image.folder), { recursive: true }).catch(console.error)

  const resp = await axios({
    url: image.url,
    method: 'GET',
    responseType: 'stream'
  })

  console.log(`[image] ${imagePath}`)

  return new Promise ((resolve, reject) => {
    resp.data.pipe(fs.createWriteStream(imagePath))
      .on('error', reject)
      .once('close', resolve)
  })
}

async function writePost (post) {
  const content = `---
layout: post
title: "${post.title}"
description: "${post.description}"
tags: []
---

${post.body}`

  const postPath = path.join(__dirname, `posts/_posts/${post.date}-${post.slug}.md`)

  console.log(`[post] ${postPath}`)

  await fs.promises.writeFile(postPath, content)
}

async function getPosts () {
  const postItems = await getEntryItems('post')
  const posts = []
  for (const postItem of postItems) {
    posts.push(convertEntryItemsToPosts(postItem))
  }

  const images = []
  for (const post of posts) {
    for (const image of post.images) {
      images.push(image)
    }
  }
  await Promise.resolve(images).map(downloadImage, { concurrency: 10 })
  await Promise.resolve(posts).map(writePost, { concurrency: 10 })
}

async function run () {
  await getPosts()
}

run()
