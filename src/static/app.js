/* global GraphExplorer, graphExplorerConfig */

const SparqlDialect = GraphExplorer.OWLStatsSettings
SparqlDialect.dataLabelProperty = graphExplorerConfig.dataLabelProperty
SparqlDialect.schemaLabelProperty = graphExplorerConfig.schemaLabelProperty

const onWorkspaceMounted = async (workspace) => {
  if (!workspace) {
    return
  }

  const model = workspace.getModel()

  model.importLayout({
    dataProvider: new GraphExplorer.SparqlDataProvider(
      {
        endpointUrl: graphExplorerConfig.endpointUrl,
        acceptBlankNodes: graphExplorerConfig.acceptBlankNodes,
        imagePropertyUris: ['http://xmlns.com/foaf/0.1/img'],
        queryMethod: GraphExplorer.SparqlQueryMethod.GET,
      },
      SparqlDialect,
    ),
  })

  /**
   * get the '?resources' search param and load those resources
   */
  const url = new URL(window.location.href)
  const resources = url.searchParams.get('resources')

  if (resources) {
    const elm = await model.dataProvider.elementInfo({
      elementIds: resources.split(';'),
    })

    const elmIds = []
    resources.split(';').forEach((item) => {
      const node = model.createElement(elm[item])
      elmIds[item] = node.id
      workspace.forceLayout()
    })

    /* now that we have the resources, add the links */
    const lnk = await model.dataProvider.linksInfo({
      elementIds: resources.split(';'),
    })

    lnk.forEach((link) => {
      const newLink = new GraphExplorer.Link({
        typeId: link.linkTypeId,
        sourceId: elmIds[link.sourceId],
        targetId: elmIds[link.targetId],
      })
      model.addLink(newLink)
      workspace.forceLayout()
    })
  }
}

const props = {
  /* a ref callback must not return a value: React treats one as a cleanup function */
  ref: (workspace) => {
    onWorkspaceMounted(workspace)
  },
  languages: graphExplorerConfig.languages,
  language: graphExplorerConfig.language,
}

GraphExplorer.renderTo(
  GraphExplorer.Workspace,
  document.getElementById('graph-explorer-instance'),
  props,
)
