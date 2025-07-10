
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Video, Camera, BarChart3, Play, Pause } from "lucide-react";
import EnhancedCamera from './EnhancedCamera';
import { RealtimeAudio } from './RealtimeAudio';
import { MetricsProvider } from '@/context/MetricsContext';
import { SettingsProvider } from '@/lib/settings-provider';
import { useInterviewSimulator } from '@/hooks/useInterviewSimulator';
import InterviewSimulation from './InterviewSimulation';

const InterviewCoachNew: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'practice' | 'simulation'>('practice');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const {
    jobRole,
    setJobRole,
    interviewStarted,
    startInterview,
    endInterview,
    isLoading
  } = useInterviewSimulator();

  const handleDataChange = (data: any, error: string | null) => {
    if (error) {
      console.error("Audio transcription error:", error);
    } else {
      console.log("Transcription data:", data);
    }
  };

  const handleInterviewComplete = (results: any) => {
    console.log("Interview completed with results:", results);
    // Handle interview completion - could show results modal, etc.
  };

  if (interviewStarted) {
    return (
      <SettingsProvider>
        <MetricsProvider>
          <div className="container max-w-7xl py-8">
            <InterviewSimulation
              interviewData={{ jobTitle: jobRole, jobCategory: 'software-development' }}
              onComplete={handleInterviewComplete}
            />
          </div>
        </MetricsProvider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <MetricsProvider>
        <div className="container max-w-7xl py-8">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Enhanced Interview Coach</h1>
              <p className="text-muted-foreground">
                Practice your interview skills with real-time feedback on speech, posture, and body language
              </p>
            </div>

            {/* Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Interview Mode</CardTitle>
                <CardDescription>Choose between practice mode or full simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={activeMode === 'practice' ? 'default' : 'outline'}
                    onClick={() => setActiveMode('practice')}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Practice Mode
                  </Button>
                  <Button
                    variant={activeMode === 'simulation' ? 'default' : 'outline'}
                    onClick={() => setActiveMode('simulation')}
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Full Simulation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {activeMode === 'practice' ? (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="camera">Camera & Posture</TabsTrigger>
                  <TabsTrigger value="audio">Audio & Speech</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Camera className="h-5 w-5" />
                          Camera Analysis
                        </CardTitle>
                        <CardDescription>
                          Monitor your posture, eye contact, and body language in real-time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedTab('camera')}
                        >
                          Start Camera Practice
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mic className="h-5 w-5" />
                          Speech Analysis
                        </CardTitle>
                        <CardDescription>
                          Practice your verbal communication with real-time transcription
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedTab('audio')}
                        >
                          Start Speech Practice
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Performance Analytics
                        </CardTitle>
                        <CardDescription>
                          View detailed analytics of your interview performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedTab('analytics')}
                        >
                          View Analytics
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="camera">
                  <EnhancedCamera />
                </TabsContent>
                
                <TabsContent value="audio">
                  <RealtimeAudio onDataChange={handleDataChange} />
                </TabsContent>
                
                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Analytics</CardTitle>
                      <CardDescription>
                        Start practicing to see your performance analytics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Analytics will appear here after you start practicing with camera and audio
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Full Interview Simulation</CardTitle>
                  <CardDescription>
                    Complete interview experience with AI interviewer, real-time feedback, and comprehensive analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="jobRole" className="text-sm font-medium min-w-fit">
                      Job Role:
                    </label>
                    <select
                      id="jobRole"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a job role</option>
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="UX Designer">UX Designer</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        AI-Powered Questions
                      </Badge>
                      <Badge variant="outline">
                        Real-time Feedback
                      </Badge>
                      <Badge variant="outline">
                        Performance Report
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={startInterview}
                      disabled={!jobRole || isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start Full Interview
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!jobRole && (
                    <p className="text-sm text-muted-foreground">
                      Please select a job role to begin the interview simulation
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </MetricsProvider>
    </SettingsProvider>
  );
};

export default InterviewCoachNew;
