import {sanityQuery, send} from "./_sanity.js";

const query = `*[_type == "project" && status == "published"] | order(projectOrder asc){
  _id,title,"slug":slug.current,year,category,client,shortDescription,featured,projectOrder,
  "thumbnail":thumbnail.asset->{url,metadata{dimensions,lqip}}
}`;

export default async function handler(req, res) {
  try { send(res, 200, await sanityQuery(query)); }
  catch (error) { send(res, 503, {error:error.message}); }
}
