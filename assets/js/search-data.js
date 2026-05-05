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
        },{id: "post-the-agent-company-part-2",
      
        title: "The Agent Company - part 2",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2026/the-agent-company-part-2/";
        
      },
    },{id: "post-when-to-put-the-washing-on-using-cursor-and-improving-security",
      
        title: "When to put the washing on? Using Cursor and improving security",
      
      description: "When to reset context, what to keep out of the model, and how AI-assisted coding can still improve security habits.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2026/when-to-wash-cursor-and-security/";
        
      },
    },{id: "post-run-tracker-part-4-why-i-turned-it-off",
      
        title: "Run tracker part 4 - Why I turned it off",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2026/run-tracker-part-4/";
        
      },
    },{id: "post-run-tracker-part-3-major-upgrade",
      
        title: "Run tracker part 3 - Major upgrade",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2026/run-tracker-part-3/";
        
      },
    },{id: "post-bluedot-and-beyond",
      
        title: "BlueDot and Beyond",
      
      description: "What I&#39;m taking forward from the BlueDot course",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/Bluedot-and-beyond/";
        
      },
    },{id: "post-supervising-others",
      
        title: "Supervising others",
      
      description: "Some reflections from several months supervising others",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/supervising-others/";
        
      },
    },{id: "post-crash-course-in-asyncio",
      
        title: "Crash course in asyncio",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/crash-course-in-asyncio/";
        
      },
    },{id: "post-the-importance-of-infosec",
      
        title: "The importance of infosec",
      
      description: "Why security matters in the age of LLMs",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/importance-of-infosec/";
        
      },
    },{id: "post-building-micrograd",
      
        title: "Building micrograd",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/building-micrograd/";
        
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
