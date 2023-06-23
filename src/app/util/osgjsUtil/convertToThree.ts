import { OSGJSScene } from '../../models/osgjs.model';
import THREE from 'three';
import uuid from 'uuid/v4';
export function ConvertToThree(obj: OSGJSScene) {
    const modelId = uuid();
    const geometry = obj['osg.Node'].Children[0]['osg.Node'].Children[0]['osg.Node'].Children[0]['osg.Geometry'];
    const vertexAttributeList = geometry.VertexAttributeList;
    const normals = vertexAttributeList.Normal.Array.Float32Array.Elements;
    const textCoord = vertexAttributeList.TexCoord0.Array.Float32Array.Elements;
    const vertices = vertexAttributeList.Vertex.Array.Float32Array.Elements;

    const threeObj = {
        metadata: {
            version: 4.5,
            type: 'Object',
            generator: "Object3D.toJSON"
        },
        "geometries": [
            {
                uuid: modelId,
                type: 'Geometry',
                data: {
                    vertices:
                }
            }
        ]
    }
}