# acts_timeline.md

metadata:
dataset_id: acts
title: Book of Acts Timeline
description: >
Structured timeline, geospatial, and relationship dataset derived from
the Book of Acts. Designed for timeline visualization, map rendering,
graph analysis, and future integration with additional historical sources.
version: "1.0.0"
schema_version: "1.0.0"
created: "2026-05-31"

sources:

* id: acts
  name: Book of Acts
  type: scripture
  citation: New Testament

places:

* id: jerusalem
  name: Jerusalem
  latitude: 31.7683
  longitude: 35.2137
  region: Judea
  modern_country: Israel

* id: damascus
  name: Damascus
  latitude: 33.5138
  longitude: 36.2765
  region: Syria
  modern_country: Syria

* id: caesarea
  name: Caesarea Maritima
  latitude: 32.5000
  longitude: 34.9000
  region: Judea
  modern_country: Israel

* id: antioch
  name: Antioch
  latitude: 36.2021
  longitude: 36.1606
  region: Roman Syria
  modern_country: Turkey

* id: philippi
  name: Philippi
  latitude: 41.0139
  longitude: 24.2867
  region: Macedonia
  modern_country: Greece

* id: athens
  name: Athens
  latitude: 37.9838
  longitude: 23.7275
  region: Achaia
  modern_country: Greece

* id: corinth
  name: Corinth
  latitude: 37.9381
  longitude: 22.9322
  region: Achaia
  modern_country: Greece

* id: ephesus
  name: Ephesus
  latitude: 37.9390
  longitude: 27.3410
  region: Asia
  modern_country: Turkey

* id: miletus
  name: Miletus
  latitude: 37.5300
  longitude: 27.2800
  region: Asia
  modern_country: Turkey

* id: malta
  name: Malta
  latitude: 35.9375
  longitude: 14.3754
  region: Mediterranean
  modern_country: Malta

* id: rome
  name: Rome
  latitude: 41.9028
  longitude: 12.4964
  region: Italia
  modern_country: Italy

people:

* id: jesus
  name: Jesus Christ
  type: central_figure

* id: peter
  name: Peter
  aliases:

  * Simon Peter
    type: apostle

* id: john
  name: John
  type: apostle

* id: james_zebedee
  name: James
  aliases:

  * James son of Zebedee
    type: apostle

* id: stephen
  name: Stephen
  type: deacon

* id: philip
  name: Philip
  type: evangelist

* id: paul
  name: Paul
  aliases:

  * Saul
  * Saul of Tarsus
    type: apostle

* id: barnabas
  name: Barnabas
  type: missionary

* id: silas
  name: Silas
  type: missionary

* id: timothy
  name: Timothy
  type: missionary

* id: luke
  name: Luke
  type: author

* id: cornelius
  name: Cornelius
  type: centurion

* id: james_brother_of_jesus
  name: James
  aliases:

  * Brother of Jesus
    type: church_leader

events:

* id: acts_001
  title: Ascension of Jesus
  date:
  start_year: 30
  end_year: 30
  certainty: estimated

  location_id: jerusalem

  participants:

  * jesus
  * peter
  * john

  categories:

  * ascension
  * apostles

  source_refs:

  * source_id: acts
    citation: Acts 1:1-11

  summary: >
  Jesus ascends into heaven and commissions the disciples.

* id: acts_002
  title: Selection of Matthias
  date:
  start_year: 30
  end_year: 30
  certainty: estimated

  location_id: jerusalem

  categories:

  * apostles
  * leadership

  source_refs:

  * source_id: acts
    citation: Acts 1:12-26

  summary: >
  Matthias is chosen to replace Judas Iscariot.

* id: acts_003
  title: Pentecost
  date:
  start_year: 30
  end_year: 30
  certainty: estimated

  location_id: jerusalem

  participants:

  * peter

  categories:

  * holy_spirit
  * church_founding

  source_refs:

  * source_id: acts
    citation: Acts 2

  summary: >
  Holy Spirit descends upon believers and thousands join the church.

* id: acts_004
  title: Healing at the Temple Gate
  date:
  start_year: 30
  end_year: 31
  certainty: estimated

  location_id: jerusalem

  participants:

  * peter
  * john

  source_refs:

  * source_id: acts
    citation: Acts 3

  categories:

  * miracle

  summary: >
  Peter heals a man lame from birth.

* id: acts_005
  title: Martyrdom of Stephen
  date:
  start_year: 32
  end_year: 32
  certainty: estimated

  location_id: jerusalem

  participants:

  * stephen
  * paul

  categories:

  * persecution
  * martyrdom

  source_refs:

  * source_id: acts
    citation: Acts 7

  summary: >
  Stephen becomes the first Christian martyr.

* id: acts_006
  title: Conversion of Saul
  date:
  start_year: 34
  end_year: 35
  certainty: estimated

  location_id: damascus

  participants:

  * paul

  categories:

  * conversion

  source_refs:

  * source_id: acts
    citation: Acts 9

  summary: >
  Saul encounters the risen Christ on the road to Damascus.

* id: acts_007
  title: Conversion of Cornelius
  date:
  start_year: 40
  end_year: 40
  certainty: estimated

  location_id: caesarea

  participants:

  * peter
  * cornelius

  categories:

  * gentile_mission

  source_refs:

  * source_id: acts
    citation: Acts 10

  summary: >
  Peter witnesses the inclusion of Gentiles into the church.

* id: acts_008
  title: Christians First Called Christians
  date:
  start_year: 42
  end_year: 42
  certainty: estimated

  location_id: antioch

  participants:

  * paul
  * barnabas

  categories:

  * church_growth

  source_refs:

  * source_id: acts
    citation: Acts 11:26

  summary: >
  The disciples are first called Christians in Antioch.

* id: acts_009
  title: Jerusalem Council
  date:
  start_year: 49
  end_year: 49
  certainty: estimated

  location_id: jerusalem

  participants:

  * peter
  * paul
  * james_brother_of_jesus

  categories:

  * doctrine
  * church_governance

  source_refs:

  * source_id: acts
    citation: Acts 15

  summary: >
  Church leaders determine Gentile converts need not fully adopt Jewish law.

* id: acts_010
  title: Philippian Jailer Converted
  date:
  start_year: 50
  end_year: 51
  certainty: estimated

  location_id: philippi

  participants:

  * paul
  * silas

  categories:

  * conversion
  * imprisonment

  source_refs:

  * source_id: acts
    citation: Acts 16

  summary: >
  An earthquake opens the prison and the jailer becomes a believer.

* id: acts_011
  title: Mars Hill Address
  date:
  start_year: 51
  end_year: 51
  certainty: estimated

  location_id: athens

  participants:

  * paul

  categories:

  * preaching

  source_refs:

  * source_id: acts
    citation: Acts 17:16-34

  summary: >
  Paul addresses philosophers at the Areopagus.

* id: acts_012
  title: Riot in Ephesus
  date:
  start_year: 55
  end_year: 55
  certainty: estimated

  location_id: ephesus

  participants:

  * paul

  categories:

  * persecution
  * church_growth

  source_refs:

  * source_id: acts
    citation: Acts 19

  summary: >
  Opposition arises due to declining worship of Artemis.

* id: acts_013
  title: Farewell to Ephesian Elders
  date:
  start_year: 57
  end_year: 57
  certainty: estimated

  location_id: miletus

  participants:

  * paul

  categories:

  * leadership

  source_refs:

  * source_id: acts
    citation: Acts 20:17-38

  summary: >
  Paul delivers his farewell address to church elders.

* id: acts_014
  title: Arrest of Paul in Jerusalem
  date:
  start_year: 57
  end_year: 57
  certainty: estimated

  location_id: jerusalem

  participants:

  * paul

  categories:

  * arrest

  source_refs:

  * source_id: acts
    citation: Acts 21

  summary: >
  Paul is arrested at the Temple.

* id: acts_015
  title: Shipwreck on Malta
  date:
  start_year: 60
  end_year: 60
  certainty: estimated

  location_id: malta

  participants:

  * paul

  categories:

  * voyage
  * miracle

  source_refs:

  * source_id: acts
    citation: Acts 27

  summary: >
  Paul's ship is wrecked but all aboard survive.

* id: acts_016
  title: Paul Under House Arrest in Rome
  date:
  start_year: 61
  end_year: 62
  certainty: estimated

  location_id: rome

  participants:

  * paul

  categories:

  * imprisonment
  * preaching

  source_refs:

  * source_id: acts
    citation: Acts 28

  summary: >
  Paul proclaims the Gospel while under Roman custody.

journeys:

* id: missionary_journey_1
  title: First Missionary Journey
  start_year: 46
  end_year: 48

  participants:

  * paul
  * barnabas

  source_refs:

  * source_id: acts
    citation: Acts 13-14

  route:

  * sequence: 1
    place_id: antioch

* id: missionary_journey_2
  title: Second Missionary Journey
  start_year: 49
  end_year: 52

  participants:

  * paul
  * silas
  * timothy

  source_refs:

  * source_id: acts
    citation: Acts 15-18

  route:

  * sequence: 1
    place_id: antioch
  * sequence: 2
    place_id: philippi
  * sequence: 3
    place_id: athens
  * sequence: 4
    place_id: corinth

* id: missionary_journey_3
  title: Third Missionary Journey
  start_year: 53
  end_year: 57

  participants:

  * paul
  * timothy

  source_refs:

  * source_id: acts
    citation: Acts 18-21

  route:

  * sequence: 1
    place_id: antioch
  * sequence: 2
    place_id: ephesus
  * sequence: 3
    place_id: miletus

relationships:

* source_id: peter
  target_id: john
  relationship_type: ministry_partner

* source_id: paul
  target_id: barnabas
  relationship_type: missionary_partner

* source_id: paul
  target_id: silas
  relationship_type: missionary_partner

* source_id: paul
  target_id: timothy
  relationship_type: mentor

* source_id: peter
  target_id: cornelius
  relationship_type: evangelized

tags:

* apostles
* church_growth
* missionary_journeys
* persecution
* miracles
* holy_spirit
* gentile_mission
* leadership
