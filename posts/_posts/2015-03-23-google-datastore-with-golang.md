---
layout: post
title: "Golang basics with Google Datastore"
description: "Just some basic operations to get started"
tags: []
---

There's really not that much documentation on how to write some Go
code to work properly with Google Datastore or how to structure
it the right way.

Yes, there are some resources, but they really aren't that great:

* [The datastore package](https://cloud.google.com/appengine/docs/go/datastore/reference)
* [Todo example app](https://github.com/GoogleCloudPlatform/appengine-angular-gotodos)

### Building your typical model

This part is pretty basic, we're just gonna create a new file where you'll be
interacting with a data structure.

{% highlight go %}
package models

import (
  "appengine"
  "appengine/datastore"
  "encoding/json"
  "io"
)

type Category struct {
  Id   int64  `json:"id" datastore:"-"`
  Name string `json:"name"`
}
{% endhighlight %}

It's important to understand what's going on here.

* `datastore:"-"` tells the datastore module not to save this field
  into the database.
* `json:"id"` renames and maps it to that name when outputting or reading
  a JSON structure.

### Methods

#### Keys

In datastore, everything is referenced by Keys and not by your Id field. In
order to update a model or create a new one, you need to generate the key
onto your model's instance.

{% highlight go %}
func (category *Category) key(c appengine.Context) *datastore.Key {
  // if there is no Id, we want to generate an "incomplete"
  // one and let datastore determine the key/Id for us
  if category.Id == 0 {
    return datastore.NewIncompleteKey(c, "Category", nil)
  }

  // if Id is already set, we'll just build the Key based
  // on the one provided.
  return datastore.NewKey(c, "Category", "", category.Id, nil)
}
{% endhighlight %}

#### Save

{% highlight go %}
func (category *Category) save(c appengine.Context) error {
  // reference the key function and generate it
  // accordingly basically its isNew true/false
  k, err := datastore.Put(c, category.key(c), category)
  if err != nil {
    return err
  }

  // The Id on the model is not prepopulated so we'll have
  // to append manually
  category.Id = k.IntID()
  return nil
}
{% endhighlight %}

#### Get All

{% highlight go %}
func GetCategories(c appengine.Context) ([]Category, error) {
  q := datastore.NewQuery("Category").Order("Name")

  var categories []Category
  keys, err := q.GetAll(c, &categories)
  if err != nil {
    return nil, err
  }

  // you'll see this a lot because instances
  // do not have this by default
  for i := 0; i < len(categories); i++ {
    categories[i].Id = keys[i].IntID()
  }

  return categories, nil
}
{% endhighlight %}

#### Get By Id

{% highlight go %}
func GetCategory(c appengine.Context, id int64) (*Category, error) {
  var category Category
  category.Id = id

  k := category.key(c)
  err := datastore.Get(c, k, &category)
  if err != nil {
    return nil, err
  }

  category.Id = k.IntID()

  return &category, nil
}
{% endhighlight %}

#### Get By Ids

Since there really isn't a "Id IN" ability in datastore, we have to
do it through an alternative method. More info on [Stack Overflow](http://stackoverflow.com/questions/29202516/doing-a-in-array-query-on-google-app-engine-datastore-with-golang).

{% highlight go %}
func GetCategoriesByIds(c appengine.Context, ids []int64) ([]Category, error) {
  var keys []*datastore.Key

  for _, id := range ids {
    keys = append(keys, datastore.NewKey(c, "Category", "", id, nil))
  }

  categories := make([]Category, len(keys))
  err := datastore.GetMulti(c, keys, categories)
  if err != nil {
    return nil, err
  }

  for i := 0; i < len(categories); i++ {
    categories[i].Id = keys[i].IntID()
  }

  return categories, nil
}
{% endhighlight %}

#### Create

{% highlight go %}
func NewCategory(c appengine.Context, r io.ReadCloser) (*Category, error) {
  var category Category

  // if you're using net/http, r = r.Body
  err := json.NewDecoder(r).Decode(&category)
  if err != nil {
    return nil, err
  }

  err = category.save(c)
  if err != nil {
    return nil, err
  }

  return &category, nil
}
{% endhighlight %}

#### Delete

{% highlight go %}
func RemoveCategory(c appengine.Context, id int64) (*Category, error) {
  category, err := GetCategory(c, id)
  if err != nil {
    return nil, err
  }

  err = datastore.Delete(c, category.key(c))
  if err != nil {
    return nil, err
  }

  return category, nil
}
{% endhighlight %}

#### Update

{% highlight go %}
func UpdateCategory(c appengine.Context, id int64, r io.ReadCloser) (*Category, error) {
  var category Category
  category.Id = id

  // gets the actual instance that is built currently
  // into our datastore
  k := category.key(c)
  err := datastore.Get(c, k, &category)
  if err != nil {
    return nil, err
  }

  // this is a temporary instance that is built
  // from `r.Body`
  var cat Category
  err = json.NewDecoder(r).Decode(&cat)
  if err != nil {
    return nil, err
  }

  // we only want specific fields to be updated
  category.Name = cat.Name

  err = category.save(c)
  if err != nil {
    return nil, err
  }

  return &category, nil
}
{% endhighlight %}