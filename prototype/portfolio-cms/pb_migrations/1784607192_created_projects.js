/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text724990059",
        "max": 120,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2560465762",
        "max": 80,
        "min": 0,
        "name": "slug",
        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3458754147",
        "max": 200,
        "min": 0,
        "name": "summary",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "convertURLs": false,
        "help": "",
        "hidden": false,
        "id": "editor3685223346",
        "maxSize": 0,
        "name": "body",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "editor"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select105650625",
        "maxSelect": 1,
        "name": "category",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "Athletes & Fitness",
          "Sports & Events",
          "Health & Adventure"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "date1962614034",
        "max": "",
        "min": "",
        "name": "shot_on",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "file2366146245",
        "maxSelect": 1,
        "maxSize": 15728640,
        "mimeTypes": [
          "image/jpeg",
          "image/png",
          "image/webp"
        ],
        "name": "cover",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [
          "400x500",
          "1200x0"
        ],
        "type": "file"
      },
      {
        "help": "",
        "hidden": false,
        "id": "file1194031162",
        "maxSelect": 60,
        "maxSize": 15728640,
        "mimeTypes": [
          "image/jpeg",
          "image/png",
          "image/webp"
        ],
        "name": "gallery",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [
          "400x500",
          "1600x0"
        ],
        "type": "file"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool1748787223",
        "name": "published",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number1169138922",
        "max": null,
        "min": null,
        "name": "sort_order",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_484305853",
    "indexes": [],
    "listRule": "published = true",
    "name": "projects",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "published = true"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853");

  return app.delete(collection);
})
