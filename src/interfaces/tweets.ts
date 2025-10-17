export interface Tweet {
  tweet_id: string
  link: string
  text: string
  author_name: string
  media?: Media
  createdAt: string
}

export interface Media {
  url: string
  altText: string
}
