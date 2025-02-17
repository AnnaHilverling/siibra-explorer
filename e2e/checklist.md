# Staging Checklist

**use incognito browser**

[home page](https://siibra-explorer.apps.hbp.eu/staging/)

## General

- [ ] Can access front page
- [ ] Can login to oidc v2 via top-right

## Atlas data specific

- [ ] Human multilevel atlas
  - [ ] on click from home page, MNI152, Julich v2.9 loads without issue
  - [ ] on hover, show correct region name(s)
  - [ ] regional is fine :: select hOC1 right
    - [ ] probabilistic map loads fine
    - [ ] segmentation layer hides
    - [ ] `navigate to` button exists, and works
    - [ ] `Open in KG` button exists and works
    - [ ] `Description` tabs exists and works
    - [ ] `Regional features` tab exists and works
      - [ ] `Receptor density` dataset exists and works
        - [ ] `Open in KG` button exists and works
        - [ ] `Preview` tab exists and works
          - [ ] fingerprint is shown, interactable
          - [ ] profiles can be loaded, interactable
          - [ ] AR can be loaded
      - [ ] `IEEG recordings` exists and works (at least 3)
        - [ ] GDPR warning triangle
        - [ ] `Open in KG` button exists and works
        - [ ] perspective view works
          - [ ] mesh becomes transparent
          - [ ] mesh transparency returns when exit the panel
          - [ ] electrodes appear in perspective view
          - [ ] some contact points should apepar red (intersect with region)
        - [ ] electrode tab
          - [ ] show should a number of contact points
          - [ ] clicking on electrode should navigate to the contact point location
    - [ ] `Connectivity` tab exists and works
      - [ ] on opening tab, PMap disappear, colour mapped segmentation appears
      - [ ] on closing tab, PMap reappear, segmentation hides
    - [ ] Explore in other templates exists, and has MNI152 and big brain
      - [ ] clicking on the respective space will load julich 2.9 in that space
      - [ ] the navigation should be preserved
  - [ ] in big brain v2.9 (or latest)
    - [ ] high res hoc1, hoc2, hoc3, lam1-6 are visible
    - [ ] pli dataset [link](https://siibra-explorer.apps.hbp.eu/staging/?templateSelected=Big+Brain+%28Histology%29&parcellationSelected=Grey%2FWhite+matter&cNavigation=0.0.0.-W000.._eCwg.2-FUe3._-s_W.2_evlu..7LIx..1uaTK.Bq5o~.lKmo~..NBW&previewingDatasetFiles=%5B%7B%22datasetId%22%3A%22minds%2Fcore%2Fdataset%2Fv1.0.0%2Fb08a7dbc-7c75-4ce7-905b-690b2b1e8957%22%2C%22filename%22%3A%22Overlay+of+data+modalities%22%7D%5D)
      - [ ] redirects fine
      - [ ] shows fine
  - [ ] fsaverage
    - [ ] can be loaded & visible
- [ ] Waxholm
  - [ ] v4 are visible
  - [ ] on hover, show correct region name(s)