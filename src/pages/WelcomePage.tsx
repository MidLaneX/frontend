import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import CloudIcon from "@mui/icons-material/Cloud";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const WelcomePage: React.FC = () => {
  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 48, color: "#0052CC" }} />,
      title: "Advanced Project Management",
      description:
        "Organize complex projects with powerful Kanban boards, sprint planning, and intelligent task tracking",
      highlight: "Most Popular",
    },
    {
      icon: <GroupIcon sx={{ fontSize: 48, color: "#36B37E" }} />,
      title: "Seamless Team Collaboration",
      description:
        "Connect teams globally with real-time updates, @mentions, file sharing, and integrated communication",
      highlight: "Team Favorite",
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: "#FF5630" }} />,
      title: "Intelligent Analytics & Insights",
      description:
        "Make data-driven decisions with comprehensive reporting, velocity tracking, and predictive analytics",
      highlight: "AI Powered",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: "#6554C0" }} />,
      title: "Enterprise-Grade Security",
      description:
        "Bank-level security with SSO, role-based permissions, audit logs, and compliance certifications",
      highlight: "SOC 2 Certified",
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: "#FF8B00" }} />,
      title: "Lightning Fast Performance",
      description:
        "Experience blazing fast load times with our optimized infrastructure and global CDN",
      highlight: "99.9% Uptime",
    },
    {
      icon: <CloudIcon sx={{ fontSize: 48, color: "#00875A" }} />,
      title: "Cloud-Native Architecture",
      description:
        "Built for scale with automatic backups, disaster recovery, and seamless integrations",
      highlight: "AWS Hosted",
    },
    {
      icon: (
        <IntegrationInstructionsIcon sx={{ fontSize: 48, color: "#0052CC" }} />
      ),
      title: "Powerful Integrations",
      description:
        "Connect with 100+ tools including Slack, GitHub, Figma, and your favorite development tools",
      highlight: "100+ Apps",
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 48, color: "#36B37E" }} />,
      title: "24/7 Expert Support",
      description:
        "Get help when you need it with our dedicated support team and comprehensive documentation",
      highlight: "Premium Support",
    },
  ];

  const benefits = [
    "Increase team productivity by 40%",
    "Reduce project delivery time by 30%",
    "Improve team collaboration efficiency",
    "Real-time project visibility",
    "Automated workflow management",
    "Enterprise-grade security & compliance",
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Engineering, TechCorp",
      avatar: "SC",
      content:
        "MidLineX transformed how our engineering team collaborates. We shipped 40% faster!",
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager, StartupXYZ",
      avatar: "MR",
      content:
        "The best project management tool we've used. Intuitive, powerful, and scales with our growth.",
    },
    {
      name: "Emily Thompson",
      role: "CTO, Enterprise Solutions",
      avatar: "ET",
      content:
        "Security and compliance features are top-notch. Perfect for enterprise environments.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#FAFBFC", minHeight: "100vw" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0052CC 0%, #0747A6 100%)",
          color: "white",
          py: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)",
            backgroundSize: "60px 60px",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "rgba(255,255,255,0.15)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  sx={{ color: "white", fontWeight: "bold", fontSize: 48 }}
                >
                  M
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "3rem", md: "4rem" },
                    letterSpacing: "-2px",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  MidLineX
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    fontWeight: 300,
                    letterSpacing: "2px",
                    mt: 1,
                  }}
                >
                  PROJECT MANAGEMENT REIMAGINED
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 600,
                maxWidth: 800,
                mx: "auto",
                lineHeight: 1.3,
                fontSize: { xs: "1.5rem", md: "2.125rem" },
              }}
            >
              Empower your team to build exceptional software with the world's
              most intuitive project management platform
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: 600,
                mx: "auto",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              Trusted by 50,000+ teams worldwide to deliver projects faster,
              collaborate better, and scale efficiently
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                component={Link}
                to="/"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "white",
                  color: "#0052CC",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 18,
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  "&:hover": {
                    bgcolor: "#F4F5F7",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.5)",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Watch Demo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip
            label="Why MidLineX?"
            sx={{
              bgcolor: "#E3FCEF",
              color: "#00875A",
              fontWeight: 600,
              px: 2,
              py: 0.5,
              mb: 3,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#172B4D",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Transform Your Team's Productivity
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#5E6C84",
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Join the thousands of teams who've revolutionized their project
            management with our enterprise-grade platform
          </Typography>
        </Box>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: 32,
            marginBottom: 48,
          }}
        >
          <div>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #DFE1E6",
                bgcolor: "white",
                height: "100%",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(9,30,66,0.15)",
                  transform: "translateY(-4px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    bgcolor: "#E3FCEF",
                    borderRadius: "50%",
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <TrendingUpIcon sx={{ color: "#00875A", fontSize: 28 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#172B4D" }}
                >
                  Proven Results
                </Typography>
              </Box>
              <Box>
                {benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  >
                    <CheckCircleIcon
                      sx={{ color: "#00875A", mr: 2, fontSize: 20 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ color: "#5E6C84", fontWeight: 500 }}
                    >
                      {benefit}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </div>

          <div>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid #DFE1E6",
                bgcolor: "white",
                height: "100%",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(9,30,66,0.15)",
                  transform: "translateY(-4px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#172B4D", mb: 3 }}
              >
                What Our Customers Say
              </Typography>
              {testimonials.map((testimonial, index) => (
                <Box
                  key={index}
                  sx={{ mb: 3, p: 3, bgcolor: "#F8F9FA", borderRadius: 2 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{ bgcolor: "#0052CC", mr: 2, width: 40, height: 40 }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "#172B4D" }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#5E6C84" }}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: "auto", display: "flex" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          sx={{ color: "#FFAB00", fontSize: 16 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#5E6C84", fontStyle: "italic" }}
                  >
                    "{testimonial.content}"
                  </Typography>
                </Box>
              ))}
            </Paper>
          </div>
        </div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip
            label="Powerful Features"
            sx={{
              bgcolor: "#E7F3FF",
              color: "#0052CC",
              fontWeight: 600,
              px: 2,
              py: 0.5,
              mb: 3,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#172B4D",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Everything You Need to Succeed
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#5E6C84",
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Discover the comprehensive suite of tools designed to streamline
            your workflow and accelerate project delivery
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
                boxShadow: "0 2px 8px rgba(9,30,66,0.15)",
                borderRadius: 3,
                border: "1px solid #DFE1E6",
                bgcolor: "white",
                position: "relative",
                overflow: "visible",
                "&:hover": {
                  boxShadow: "0 12px 32px rgba(9,30,66,0.15)",
                  transform: "translateY(-8px)",
                },
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {feature.highlight && (
                <Chip
                  label={feature.highlight}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: 16,
                    bgcolor: "#FF5630",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "11px",
                    zIndex: 1,
                  }}
                />
              )}
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "center",
                    "& svg": {
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                    },
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#172B4D",
                    mb: 2,
                    fontSize: "18px",
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#5E6C84",
                    lineHeight: 1.6,
                    fontSize: "14px",
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Final CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #172B4D 0%, #091E42 100%)",
          py: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,82,204,0.3) 0%, transparent 70%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(54,179,126,0.2) 0%, transparent 70%)",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", color: "white" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Ready to Transform Your Team?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Join 50,000+ teams who trust MidLineX to deliver exceptional
              software faster and more efficiently than ever before.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 4,
              }}
            >
              <Button
                component={Link}
                to="/"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#0052CC",
                  color: "white",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 18,
                  px: 5,
                  py: 2,
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,82,204,0.4)",
                  "&:hover": {
                    bgcolor: "#0747A6",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(0,82,204,0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Start Your 30-Day Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.5)",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Schedule Demo
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircleIcon sx={{ color: "#00875A", mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  No credit card required
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircleIcon sx={{ color: "#00875A", mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Cancel anytime
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircleIcon sx={{ color: "#00875A", mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  24/7 premium support
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
