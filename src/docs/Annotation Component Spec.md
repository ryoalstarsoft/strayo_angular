# Understanding Annotations

Annotations are data and visualizations of the data they contain. I'll repeat that again so that you can understand the importance of that statement.
> Annotations are data and visualizations of data they contain.

There are several implications of that statement.

1. Annotations contain all data necessary for visualizating them.
In the current Architecture, this data is split across three properties of
annotations: `meta`, `data`, and `resources`.
2. Annotations must be deserialized for viewing, and serializable for editing.
3. Any information that needs to be visualized MUST be stored as an annotation.

Rule number 3 is a self imposed rule to promote consistency across our app.

Let's take a deeper dive into each of these rules.

> Annotations contain all data necessary for visualizaing them.

The `meta` property is a json structure containing all data that can't be described as the abstraction of a physical property. For instance structures like
```json
{
    "last_modified_by": "David Ayeke"
}
```
would be an appropriate use of the `meta` property, but
```json
{
    "magazine": "E8265",
    "capacity": 20,
    "current_inventory": 10,
    "last_modified_by": "Buck Lee"
}
```
would not be a good use as it mixes physical and abstract properites.

How then should we store information about phyisical properties?
**GeoJSON!**

##### Technical Note
```
In the future other more... efficent formats such as TopoJSON may be used.
For the current technical requirements, GeoJSON works just fine.
```

If Datasets are time slices of a site, then Annotations can be thought of as geographic slices for components of that site. Lets go back to the magazine example, and see how this information would be stored as an annotation. **Note that the `data` property is the accessor for the geojson**
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [125.6, 10.1]
  },
  "properties": {
    "magazine": "E8265",
    "capacity": 20,
    "current_inventory": 10
  }
}
```
Here we define a point feature. A **Feature** is an object with a **Geometry**. Properties of the object itself (in this case a magazine) go under the main body of the json structure. Geographical information goes under the geometry property. Geojson works for many shapes and structures. For tracking a single object, a Point geometry works find. However, for more abstract visualizations like shotplan rows or haul road paths, LineString and Polygon geometries are available. Read a [quick guide](https://macwright.org/2015/03/23/geojson-second-bite) as well as the very easy to read [spec](https://tools.ietf.org/html/rfc7946) which go over useful utilities like `FeatureCollections`. This makes it easy to serialize concepts like a shotplan. A shotplan is a series of line features representing rows, and point features representing circles.

##### Technical Note
For consistency across the Strayos platform. All coordinates are expected to be in LonLat EPSG:4326 format.


There are tools in place for automatically creating visualizations for GeoJSON data, and I encourage you to use them. However, some visualizations require data that cannot just be stored in json format such as 3D models, images, and files. These should be fetched separately from the annotation. For this reason, Annotations have a set of Resources (accessed through the `resource` property) as defined by the Resource spec. It is assumed that whatever module handling the Annotation will fetch the resource, and use it as necessary. A good example of this is a path annotation with a custom truck image. The resource for that annotation can be the url to that truck.png.

The finally annotated json structure of an annotation looks like the following.

```json
{
    "type": "Unique name so that modules can filter through annotations
    and determine if they need to handle them. Names like 'shotplan' or 'stereoscope' work.",
    "meta": {
        "is": "a json structure containing arbitrary informaiton",
        "does_not": "contain geographic or physical properties."
    },
    "data": {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [125.6, 10.1]
        },
        "properties": {
            "projection": "Always WebMercator",
        }
    },
    "resources": ["http://url.com"]
}
```

> Annotations must be deserialized for viewing, and serializable for editing.

Annotations are just json structures. If you follow the guidelines properly, they should be trival to serialize and deserialized. For instance, any meta data that needs to be changed, is usually just a simple property update. Resources are urls, creating a new one is as easy as updating the link or updating the actual resource that the server will respond with. What if you would like to serialize something as complex as a shotplan? or a burden? This is where GeoJSON shines. Our 2D library, OpenLayers, defines many utility functions for updating things like the endpoints of lines or calculating the perimeter of a polygon. In addition, in OpenLayers features are EventTarget's so listening to these changes is as simple as calling the `on('change:prop', () => {})` or `once('change:prop', () => {})` functions. Our 3D library automatically takes care of making sure these changes get reflected in the 3D visualization as long as use use a `ol.layer.Vector` as your main way of styling these features. GeoJSON (and other formats) can be serialized and deserialized as easily as calling the `writeFeature` and `readFeature` utility functions.

> Any information that needs to be visualized MUST be stored as an annotation.

This rule's sole purpose is to maintain consitency across our apps. In the future Strayos will grow beyond just a single webapp. In order to accomodate the many microservices and applications we will soon be developing, Annotations were developed. The spec is still in its youth, and I hope you will contact me with your ideas to make it beter.