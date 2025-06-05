// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-principles",
          title: "principles",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/principles/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "post-llm-post-training",
      
        title: "LLM post-training",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/LLM-engineering/";
        
      },
    },{id: "post-self-development-plans",
      
        title: "Self development plans",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/self-development-plans/";
        
      },
    },{id: "post-run-tracker-part-2-aws-lambda",
      
        title: "Run tracker part 2 - AWS Lambda",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/run-tracker-part-2/";
        
      },
    },{id: "post-run-tracker-mvp",
      
        title: "Run tracker MVP",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/run-tracker-MVP/";
        
      },
    },{id: "post-get-big-things-done-in-data-science",
      
        title: "Get big things done (in data science)",
      
      description: "Some useful points from Bent Flyvbjerg and Dan Gardner, as applied to data science",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/get-big-things-done/";
        
      },
    },{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-run-tracker",
          title: 'Run tracker',
          description: "Suggesting my next run using Garmin and an LLM.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_run_tracker/";
            },},{id: "projects-cycle-predictor",
          title: 'Cycle predictor',
          description: "Forecasting cycling traffic in London.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_cycle_predictor/";
            },},{id: "projects-neurips-workshop-paper",
          title: 'NeurIPS workshop paper',
          description: "Deep learning research",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_neurips_paper/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%6F%75@%65%78%61%6D%70%6C%65.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1010907", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=qc6CJjYAAAAJ", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://www.alberteinstein.com/", "_blank");
        },
      },];
