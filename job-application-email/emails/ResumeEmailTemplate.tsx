import { Html, Head, Body, Container, Preview } from "@react-email/components";
import * as React from "react";

export default function ResumeEmailTemplate() {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Roboto:wght@300;400;700&display=swap');

          body {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', Arial, sans-serif;
              background-color: #f4f6f8;
              -webkit-font-smoothing: antialiased;
          }

          .template-wrapper {
              max-width: 650px;
              margin: 40px auto;
              background-color: #ffffff;
              box-shadow: 0 15px 35px rgba(0,0,0,0.1);
              position: relative;
          }

          .header {
              background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');
              background-size: cover;
              background-position: center;
              padding: 60px 30px;
              text-align: center;
              color: #ffffff;
          }

          .header h1 {
              font-family: 'Oswald', sans-serif;
              font-size: 42px;
              margin: 0;
              letter-spacing: 2px;
              text-transform: uppercase;
          }

          .header h2 {
              color: #ffcc00;
              font-size: 18px;
              font-weight: 400;
              margin: 10px 0 25px 0;
              letter-spacing: 1px;
              text-transform: uppercase;
          }

          .header .btn {
              display: inline-block;
              background-color: #ffcc00;
              color: #111;
              padding: 12px 25px;
              text-decoration: none;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 14px;
              border-radius: 4px;
              margin-bottom: 20px;
              transition: background 0.3s;
          }
          
          .header .btn:hover {
              background-color: #e6b800;
          }

          .header .contact-links {
              font-size: 14px;
          }

          .header .contact-links a {
              color: #fff;
              text-decoration: none;
              margin: 0 10px;
              border-bottom: 1px solid transparent;
              padding-bottom: 2px;
          }

          .header .contact-links a:hover {
              border-bottom: 1px solid #ffcc00;
          }

          .content-area {
              position: relative;
              padding: 40px 0;
          }

          .content-area::before {
              content: '';
              position: absolute;
              top: 0;
              bottom: 0;
              left: 50%;
              width: 2px;
              border-left: 3px dashed #ffcc00;
              transform: translateX(-50%);
              z-index: 1;
          }

          .section {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 30px 40px;
              position: relative;
              z-index: 2;
          }

          .section:nth-child(even) {
              flex-direction: row-reverse;
          }

          .section::before {
              content: '';
              position: absolute;
              left: 50%;
              top: 50%;
              width: 14px;
              height: 14px;
              background-color: #ffcc00;
              border: 4px solid #fff;
              border-radius: 50%;
              transform: translate(-50%, -50%);
              z-index: 3;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }

          .image-col {
              width: 42%;
          }

          .image-col img {
              width: 100%;
              border-radius: 8px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.15);
              display: block;
          }

          .text-col {
              width: 48%;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          }

          .text-col h3 {
              font-family: 'Oswald', sans-serif;
              font-size: 22px;
              color: #111;
              margin: 0 0 15px 0;
              text-transform: uppercase;
          }

          .text-col p {
              font-size: 13.5px;
              color: #555;
              line-height: 1.6;
              margin: 0 0 10px 0;
          }

          .text-col ul {
              padding-left: 20px;
              margin: 0;
              color: #555;
              font-size: 13.5px;
              line-height: 1.6;
          }
          
          .text-col li {
              margin-bottom: 6px;
          }
          
          .badge {
              display: inline-block;
              background: #f0f0f0;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              color: #333;
              margin-right: 5px;
              margin-bottom: 5px;
          }

          .footer {
              background-color: #111;
              color: #fff;
              text-align: center;
              padding: 40px 30px;
          }

          .footer h3 {
              font-family: 'Oswald', sans-serif;
              font-size: 28px;
              margin: 0 0 10px 0;
              color: #ffcc00;
              text-transform: uppercase;
          }

          .footer p {
              font-size: 13px;
              color: #999;
              margin: 0 0 20px 0;
          }

          .footer .social-icons a {
              display: inline-block;
              margin: 0 10px;
              color: #fff;
              text-decoration: none;
              font-size: 14px;
              font-weight: 700;
          }
          .footer .social-icons a:hover {
              color: #ffcc00;
          }

          @media (max-width: 600px) {
              .section {
                  flex-direction: column !important;
                  padding: 20px;
              }
              .content-area::before, .section::before {
                  display: none;
              }
              .image-col, .text-col {
                  width: 100%;
                  margin-bottom: 20px;
              }
          }
        `}</style>
      </Head>
      <Preview>Yogesh Kumar - Full-Stack & Mobile Developer</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#f4f6f8" }}>
        <Container style={{ maxWidth: "650px", margin: "40px auto", backgroundColor: "#ffffff", position: "relative" }}>
          
          <div className="header">
              <h1>Yogesh Kumar</h1>
              <h2>Full-Stack & Mobile Developer</h2>
              <a href="mailto:Yogesharma914@gmail.com" className="btn">Contact Me</a>
              <div className="contact-links">
                  <a href="#">+91-9350161043</a> | 
                  <a href="#">LinkedIn</a> | 
                  <a href="#">GitHub</a> | 
                  <a href="#">Portfolio</a>
              </div>
          </div>

          <div className="content-area">
              <div className="section">
                  <div className="image-col">
                      <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Coding" />
                  </div>
                  <div className="text-col">
                      <h3>Summary</h3>
                      <p>Specializing in <strong>React Native, Next.js, and Python</strong>. I build production-grade apps backed by serverless AWS infrastructure.</p>
                      <p>Experienced in integrating complex third-party systems (GetStream, Cashfree, Razorpay) and implementing fintech logic including escrow flows and double-entry ledgers.</p>
                  </div>
              </div>

              <div className="section">
                  <div className="image-col">
                      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Skills" />
                  </div>
                  <div className="text-col">
                      <h3>Technical Skills</h3>
                      <div>
                          <span className="badge">TypeScript</span>
                          <span className="badge">Python</span>
                          <span className="badge">React Native</span>
                          <span className="badge">Next.js</span>
                          <span className="badge">AWS Lambda</span>
                          <span className="badge">MongoDB</span>
                          <span className="badge">Supabase</span>
                          <span className="badge">PostgreSQL</span>
                      </div>
                      <ul style={{ marginTop: "10px" }}>
                          <li><strong>Frontend:</strong> React.js, React Native, Expo, Tailwind CSS</li>
                          <li><strong>Backend:</strong> Node.js, Python, REST APIs, JWT</li>
                          <li><strong>Cloud:</strong> Serverless AWS Microservices</li>
                      </ul>
                  </div>
              </div>

              <div className="section">
                  <div className="image-col">
                      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Experience" />
                  </div>
                  <div className="text-col">
                      <h3>Experience</h3>
                      <p><strong>Indiefluence</strong><br/><em>Full-Stack Developer (May 2025 - Present)</em></p>
                      <ul>
                          <li>Developed full-stack web/mobile apps using React.js, React Native, Next.js.</li>
                          <li>Designed RESTful APIs with JWT & webhook handling.</li>
                          <li>Built serverless microservices on AWS Lambda with API Gateway.</li>
                      </ul>
                  </div>
              </div>

              <div className="section">
                  <div className="image-col">
                      <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Projects" />
                  </div>
                  <div className="text-col">
                      <h3>Featured Projects</h3>
                      <p><strong>Pawgloo</strong> - Veterinary Telehealth & Pet Social Platform</p>
                      <ul>
                          <li>Architected full frontend/backend of a dual-app ecosystem using React Native and AWS Lambda.</li>
                          <li>Built a fraud-proof double-entry ledger payment system using MongoDB atomic transactions.</li>
                      </ul>
                      <p style={{ marginTop: "10px" }}><strong>Lukewarm</strong> - AI Business Card CRM</p>
                      <ul>
                          <li>Led frontend development and cross-platform sync.</li>
                      </ul>
                  </div>
              </div>

              <div className="section">
                  <div className="image-col">
                      <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Education" />
                  </div>
                  <div className="text-col">
                      <h3>Education</h3>
                      <p><strong>Seth Jai Parkash Mukand Lal Institute of Engineering and Technology</strong></p>
                      <p>B.Tech in Information Technology (IT)<br/><em>2021 – 2025</em></p>
                  </div>
              </div>
          </div>

          <div className="footer">
              <h3>Let's Build Something Great</h3>
              <p>Currently open for new opportunities and collaborations.</p>
              <div className="social-icons">
                  <a href="#">LINKEDIN</a>
                  <a href="#">GITHUB</a>
                  <a href="#">LEETCODE</a>
                  <a href="#">PORTFOLIO</a>
              </div>
          </div>

        </Container>
      </Body>
    </Html>
  );
}
