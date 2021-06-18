export interface IProject {
  name: string;
  desc: string;
  url: string;
  image: string;
  createdAt: string;
}

export const projects: IProject[] = [
  {
    name: 'Share A Pantry',
    desc: 'A contribution to the community pantry initiative.',
    url: 'https://shareapantry.com',
    image:
      'https://on-demand.bannerbear.com/taggedurl/1Qa2J0MB0b5k79GRpq/image.jpg?modifications=[message---text~~Find+pantries+built+by+the+community,+for+the+community]',
    createdAt: '2020-05-10',
  },
  {
    name: '.NET iToolkit',
    desc: '.Net XML serialization/deserialization for XmlService',
    url: 'https://github.com/frive/dotnet-itoolkit',
    image:
      'https://opengraph.githubassets.com/928179d1a4457c2498aa54de42812d73935ce6f1c494a408fb9bd2b90e471f9b/frive/dotnet-itoolkit',
    createdAt: '2018-11-12',
  },
];
